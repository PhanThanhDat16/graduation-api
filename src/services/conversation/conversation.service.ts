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

const GROUP_TYPES = ['contract_chat', 'dispute', 'guest_support', 'user_support'] as EChatGroupType[]

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
    fullName: o.fullName ?? '',
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
      type: EChatGroupType.GUEST_SUPPORT,
      memberIds: [guestUser._id.toString()]
    } as any)

    // Create chat_member for guest
    await ChatMember.create({
      groupId: chatGroup._id,
      userId: guestUser._id,
      role: EChatMemberRole.OWNER
    })

    // Create default message "tôi cần hỗ trợ"
    const defaultContent = 'tôi cần hỗ trợ'
    await Message.create({
      groupId: chatGroup._id,
      senderId: guestUser._id,
      senderName: guestName,
      senderType: 'guest',
      type: 'text',
      content: defaultContent
    } as any)

    // Update lastMessage on the chat group
    await ChatGroup.findByIdAndUpdate(chatGroup._id, {
      lastMessage: defaultContent,
      lastMessageAt: new Date(),
      lastSenderId: guestUser._id
    })

    return this.formatConversationResponse(chatGroup as any)
  },

  async getConversationById(groupId: string): Promise<IChatGroup | null> {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      throw new Error('Invalid group ID')
    }

    return ChatGroup.findById(groupId).populate('ownerId', 'fullName email avatar').lean() as any
  },

  async getConversationByUserId(userId: string, groupId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID')
    }

    return ChatGroup.findOne({
      ownerId: new mongoose.Types.ObjectId(userId),
      _id: groupId,
      type: 'guest_support'
    })
      .populate('ownerId', 'fullName email avatar')
      .lean() as any
  },

  async mergeGuestConversation(guestUserId: string, newUserId: string): Promise<ConversationResponse> {
    // Validate both IDs
    if (!mongoose.Types.ObjectId.isValid(guestUserId) || !mongoose.Types.ObjectId.isValid(newUserId)) {
      throw new Error('Invalid user ID')
    }

    // Find the guest conversation
    const guestGroup = await ChatGroup.findOne({
      ownerId: new mongoose.Types.ObjectId(guestUserId),
      type: EChatGroupType.GUEST_SUPPORT
    })

    if (!guestGroup) {
      throw new Error('Guest conversation not found')
    }

    // Check if the user already has an active USER_SUPPORT conversation
    const existingUserConversation = await ChatGroup.findOne({
      ownerId: new mongoose.Types.ObjectId(newUserId),
      type: EChatGroupType.USER_SUPPORT
    })

    if (existingUserConversation) {
      // --- User already has a USER_SUPPORT conversation ---
      // Discard the guest conversation entirely
      await Message.deleteMany({ groupId: guestGroup._id })
      await ChatMember.deleteMany({ groupId: guestGroup._id })
      await ChatGroup.deleteOne({ _id: guestGroup._id })

      // Delete guest user (role='other')
      await User.deleteOne({
        _id: new mongoose.Types.ObjectId(guestUserId),
        role: 'other'
      })

      // Return the existing conversation
      const refreshed = (await ChatGroup.findById(existingUserConversation._id).lean()) as any
      return this.formatConversationResponse(refreshed)
    }

    // --- No existing USER_SUPPORT conversation → convert the guest one ---

    // Update all messages from guest user to new user
    await Message.updateMany(
      { groupId: guestGroup._id, senderId: new mongoose.Types.ObjectId(guestUserId) },
      { $set: { senderId: new mongoose.Types.ObjectId(newUserId), senderType: 'user', senderName: null } }
    )

    // Update ChatMember from guest user to new user
    await ChatMember.updateOne(
      { groupId: guestGroup._id, userId: new mongoose.Types.ObjectId(guestUserId) },
      { $set: { userId: new mongoose.Types.ObjectId(newUserId) } }
    )

    // Build update fields for the chat group
    const updateFields: any = {
      ownerId: new mongoose.Types.ObjectId(newUserId),
      type: EChatGroupType.USER_SUPPORT,
      guestName: null
    }
    if (guestGroup.lastSenderId?.toString() === guestUserId) {
      updateFields.lastSenderId = new mongoose.Types.ObjectId(newUserId)
    }

    const updatedChatGroup = (await ChatGroup.findOneAndUpdate(
      { _id: guestGroup._id },
      { $set: updateFields },
      { new: true }
    ).lean()) as any

    // Update memberIds array: replace guestUserId with newUserId
    await ChatGroup.updateOne(
      { _id: guestGroup._id },
      { $set: { 'memberIds.$[elem]': newUserId } },
      { arrayFilters: [{ elem: guestUserId }] }
    )

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
      role: (id === creatorUserId ? 'owner' : 'member') as EChatMemberRole
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
      assignedStaffId: populated.assignedStaffId ? populated.assignedStaffId.toString() : null,
      lastMessage: populated.lastMessage,
      lastMessageAt: populated.lastMessageAt ?? null,
      lastSenderId: toPublicUser(populated.lastSenderId),
      createdAt: populated.createdAt,
      unreadCount: unread_count
    } as ChatGroupListItem
  },

  async listGroupsForUser(userId: string, type?: string) {
    requireValidId(userId, 'user id')

    // Check if user is staff to also show unassigned support conversations
    const user = (await User.findById(userId).select('role').lean()) as any
    const isStaff = user?.role === 'staff'

    const memberships = (await ChatMember.find({ userId: userId }).select('groupId').lean()) as any[]
    const groupIds = memberships.map((m) => m.groupId.toString())

    // Build query: user's own groups + unassigned support groups for staff
    let query: any = isStaff
      ? {
          $or: [
            ...(groupIds.length > 0 ? [{ _id: { $in: groupIds } }] : []),
            {
              assignedStaffId: null,
              type: { $in: ['guest_support', 'user_support'] }
            }
          ]
        }
      : groupIds.length > 0
        ? { _id: { $in: groupIds } }
        : null

    if (!query) return []

    // Apply type filter if provided
    if (type) {
      query = { $and: [query, { type }] }
    }

    const groups = (await ChatGroup.find(query)
      .populate('lastSenderId', 'fullName avatar')
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean()) as any[]

    const unreadCounts = await Promise.all(groups.map((g) => countUnreadForGroup(userId, g._id.toString())))

    return groups.map((g, i) => {
      const ownerIdStr = g.ownerId ? g.ownerId.toString() : null
      const filteredMemberIds = Array.isArray(g.memberIds) ? g.memberIds.filter((id: string) => id !== ownerIdStr) : []

      return {
        _id: g._id.toString(),
        memberIds: filteredMemberIds,
        ownerId: ownerIdStr,
        type: g.type as EChatGroupType,
        disputeId: g.disputeId ? g.disputeId.toString() : null,
        assignedStaffId: g.assignedStaffId ? g.assignedStaffId.toString() : null,
        lastMessage: g.lastMessage,
        lastMessageAt: g.lastMessageAt ?? null,
        lastSenderId: toPublicUser(g.lastSenderId),
        createdAt: g.createdAt,
        unreadCount: unreadCounts[i] ?? 0
      }
    }) as ChatGroupListItem[]
  },

  async reassignStaffConversations(fromStaffId: string, toStaffId: string) {
    requireValidId(fromStaffId, 'fromStaffId')
    requireValidId(toStaffId, 'toStaffId')

    // Find all groups assigned to the old staff
    const groups = (await ChatGroup.find({
      assignedStaffId: new mongoose.Types.ObjectId(fromStaffId)
    }).lean()) as any[]

    if (groups.length === 0) {
      return { reassignedCount: 0 }
    }

    const groupIds = groups.map((g) => g._id)

    // Update assignedStaffId on all groups
    await ChatGroup.updateMany(
      { _id: { $in: groupIds } },
      { $set: { assignedStaffId: new mongoose.Types.ObjectId(toStaffId) } }
    )

    // Update memberIds: remove old staff, add new staff
    await ChatGroup.updateMany({ _id: { $in: groupIds } }, {
      $pull: { memberIds: fromStaffId },
      $addToSet: { memberIds: toStaffId }
    } as any)

    // Update ChatMember records: replace old staff with new staff
    for (const gId of groupIds) {
      // Remove old staff member
      await ChatMember.deleteOne({
        groupId: gId,
        userId: new mongoose.Types.ObjectId(fromStaffId)
      })
      // Upsert new staff member
      await ChatMember.updateOne(
        { groupId: gId, userId: new mongoose.Types.ObjectId(toStaffId) },
        {
          $setOnInsert: {
            groupId: gId,
            userId: new mongoose.Types.ObjectId(toStaffId),
            role: EChatMemberRole.MEMBER
          }
        },
        { upsert: true }
      )
    }

    return { reassignedCount: groups.length }
  },

  async listAllConversations(type?: string) {
    const filter: any = {}
    if (type && ['guest_support', 'user_support', 'contract_chat', 'dispute'].includes(type)) {
      filter.type = type
    }

    const groups = (await ChatGroup.find(filter)
      .populate('lastSenderId', 'fullName avatar')
      .populate('ownerId', 'fullName avatar')
      .populate('assignedStaffId', 'fullName avatar')
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean()) as any[]

    return groups.map((g) => {
      // const ownerIdStr = g.ownerId?._id ? g.ownerId._id.toString() : g.ownerId ? g.ownerId.toString() : null

      return {
        _id: g._id.toString(),
        memberIds: Array.isArray(g.memberIds) ? g.memberIds : [],
        ownerId: toPublicUser(g.ownerId),
        // ownerInfo: toPublicUser(g.ownerId),
        type: g.type as EChatGroupType,
        disputeId: g.disputeId ? g.disputeId.toString() : null,
        assignedStaffId: g.assignedStaffId?._id ? g.assignedStaffId._id.toString() : null,
        assignedStaffInfo: toPublicUser(g.assignedStaffId),
        guestName: g.guestName ?? null,
        lastMessage: g.lastMessage,
        lastMessageAt: g.lastMessageAt ?? null,
        lastSenderId: toPublicUser(g.lastSenderId),
        createdAt: g.createdAt
      }
    })
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
