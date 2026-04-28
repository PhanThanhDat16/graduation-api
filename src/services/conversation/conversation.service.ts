import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { ChatGroup, IChatGroup } from '@/models/chat_group.model'
import { Message } from '@/models/message.model'
import { User } from '@/models/user.model'
import {
  ChatGroupListItem,
  CreateChatGroupBody,
  EChatGroupType,
  EChatMemberRole,
  PublicChatUser
} from '@/constants/chat.constants'
import { ChatMember } from '@/models/chat_member.model'
import { MessageRead } from '@/models/message_read.model'

export interface ConversationResponse {
  group_id: string
  user_id: string | null
  guestName: string | null
  createdAt: Date
}

const GROUP_TYPES = ['contract_chat', 'guest_support', 'user_support'] as EChatGroupType[]

const requireValidId = (id: string, label: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}`)
  }
}

const getLastReadAtForGroup = async (userId: string, groupId: string): Promise<Date | null> => {
  const agg = await MessageRead.aggregate<{ lastRead: Date | null }>([
    { $match: { user_id: userId } },
    {
      $lookup: {
        from: 'messages',
        localField: 'message_id',
        foreignField: '_id',
        as: 'msg'
      }
    },
    { $unwind: '$msg' },
    { $match: { 'msg.group_id': groupId } },
    { $group: { _id: null, lastRead: { $max: '$read_at' } } }
  ]).exec()

  return agg.length > 0 && agg[0].lastRead ? agg[0].lastRead : null
}

const countUnreadForGroup = async (userId: string, groupId: string): Promise<number> => {
  const lastRead = await getLastReadAtForGroup(userId, groupId)
  if (lastRead) {
    return Message.countDocuments({
      group_id: groupId,
      sender_id: { $ne: userId },
      createdAt: { $gt: lastRead }
    })
  }
  return Message.countDocuments({
    group_id: groupId,
    sender_id: { $ne: userId }
  })
}

const toPublicUser = (u: unknown): PublicChatUser | null => {
  if (!u || typeof u !== 'object') return null
  const o = u as { _id: { toString(): string }; fullName?: string; avatar?: string }
  return {
    _id: o._id.toString(),
    full_name: o.fullName ?? '',
    avatar: o.avatar ?? ''
  }
}

export const conversationService = {
  async createGuestConversation(guestName: string) {
    // Create a temporary user with role 'other' for guest
    const guestUser = await User.create({
      fullName: guestName,
      password: 'guest_' + uuidv4(), // Temporary password for guest user
      role: 'other',
      status: 'active',
      isVerified: false,
      email: `guest_${uuidv4()}@guest.local` // Unique email for guest user
    })

    // Create chat group with ownerId pointing to guest user
    const chatGroup = await ChatGroup.create({
      ownerId: guestUser._id,
      guestName: guestUser.fullName,
      type: 'guest_support'
    } as any)

    return this.formatConversationResponse(chatGroup as any)
  },

  async getConversationById(groupId: string): Promise<IChatGroup | null> {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      throw new Error('Invalid group ID')
    }

    return ChatGroup.findById(groupId).lean() as any
  },

  async getConversationByUserId(userId: string, groupId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID')
    }

    return ChatGroup.findOne({
      ownerId: new mongoose.Types.ObjectId(userId),
      _id: groupId,
      type: 'guest_support'
    }).lean() as any
  },

  async mergeGuestConversation(guestUserId: string, newUserId: string): Promise<ConversationResponse> {
    // Validate both IDs
    if (!mongoose.Types.ObjectId.isValid(guestUserId) || !mongoose.Types.ObjectId.isValid(newUserId)) {
      throw new Error('Invalid user ID')
    }

    // Find chat_group owned by guest user
    const chatGroup = await ChatGroup.findOne({
      ownerId: new mongoose.Types.ObjectId(guestUserId),
      type: 'guest_support'
    })

    if (!chatGroup) {
      throw new Error('Guest conversation not found')
    }

    // Update all messages from guest user to new user
    await Message.updateMany(
      { groupId: chatGroup._id, senderId: new mongoose.Types.ObjectId(guestUserId) },
      { senderId: new mongoose.Types.ObjectId(newUserId) }
    )

    // Update chat_group to link with new user account
    const updatedChatGroup = (await ChatGroup.findOneAndUpdate(
      { _id: chatGroup._id },
      {
        ownerId: new mongoose.Types.ObjectId(newUserId)
      } as any,
      { new: true }
    ).lean()) as any

    // Delete guest user (role='other') since it's merged
    await User.deleteOne({
      _id: new mongoose.Types.ObjectId(guestUserId),
      role: 'other'
    })

    return this.formatConversationResponse(updatedChatGroup)
  },

  async createGroup(creatorUserId: string, body: CreateChatGroupBody) {
    requireValidId(creatorUserId, 'user id')

    if (!body.type || !GROUP_TYPES.includes(body.type)) {
      throw new Error('Invalid group type')
    }

    if (!Array.isArray(body.memberIds)) {
      throw new Error('memberIds must be an array')
    }

    const memberSet = new Set<string>(body.memberIds.filter((id) => mongoose.Types.ObjectId.isValid(id)))
    memberSet.add(creatorUserId)

    const memberIds = [...memberSet]

    const disputeId = body.disputeId && mongoose.Types.ObjectId.isValid(body.disputeId) ? body.disputeId : undefined

    const group = await ChatGroup.create({
      type: body.type,
      memberIds: memberIds,
      ...(disputeId ? { disputeId: disputeId } : {}),
      ownerId: creatorUserId,
      lastMessage: ''
    } as any)

    const membersPayload = memberIds.map((id) => ({
      groupId: group._id,
      userId: id,
      role: (id === creatorUserId ? 'administrator' : 'member') as EChatMemberRole
    }))

    await ChatMember.insertMany(membersPayload)

    const populated = (await ChatGroup.findById(group._id)
      .populate('lastSenderId', 'fullName avatar')
      .lean()) as IChatGroup | null

    if (!populated) {
      throw new Error('Failed to load created group')
    }

    const gid = populated._id.toString()
    const unread_count = await countUnreadForGroup(creatorUserId, gid)

    return {
      _id: gid,
      memberIds: Array.isArray(populated.memberIds) ? populated.memberIds : [],
      ownerId: populated.ownerId ? populated.ownerId.toString() : null,
      type: populated.type as EChatGroupType,
      disputeId: populated.disputeId ? populated.disputeId.toString() : null,
      lastMessage: populated.lastMessage,
      lastMessageAt: populated.lastMessageAt ?? null,
      lastSenderId: toPublicUser(populated.lastSenderId),
      createdAt: populated.createdAt,
      unreadCount: unread_count
    } as ChatGroupListItem
  },

  async listGroupsForUser(userId: string) {
    requireValidId(userId, 'user id')

    const memberships = (await ChatMember.find({ userId: userId }).select('groupId').lean()) as any[]
    const groupIds = memberships.map((m) => m.groupId.toString())
    if (groupIds.length === 0) return []

    const groups = (await ChatGroup.find({ _id: { $in: groupIds } })
      .populate('lastSenderId', 'fullName avatar')
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean()) as any[]

    const unreadCounts = await Promise.all(groups.map((g) => countUnreadForGroup(userId, g._id.toString())))

    return groups.map((g, i) => ({
      _id: g._id.toString(),
      memberIds: Array.isArray(g.memberIds) ? g.memberIds : [],
      ownerId: g.ownerId ? g.ownerId.toString() : null,
      type: g.type as EChatGroupType,
      disputeId: g.disputeId ? g.disputeId.toString() : null,
      lastMessage: g.lastMessage,
      lastMessageAt: g.lastMessageAt ?? null,
      lastSenderId: toPublicUser(g.lastSenderId),
      createdAt: g.createdAt,
      unreadCount: unreadCounts[i] ?? 0
    })) as ChatGroupListItem[]
  },

  formatConversationResponse(chatGroup: IChatGroup): ConversationResponse {
    return {
      group_id: chatGroup._id.toString(),
      user_id: chatGroup.ownerId ? chatGroup.ownerId.toString() : null,
      guestName: chatGroup.guestName,
      createdAt: chatGroup.createdAt
    }
  }
}
