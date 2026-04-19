import mongoose from 'mongoose'

import { ChatGroup } from '@/models/chat_group.model'
import { ChatMember } from '@/models/chat_member.model'
import { Message } from '@/models/message.model'
import { MessageRead } from '@/models/message_read.model'
// import { emitChatNewMessage } from '@/socket/chatEmit'
import {
  ChatGroupListItem,
  EChatGroupType,
  EChatMemberRole,
  CreateChatGroupBody,
  GroupMemberRow,
  EMessageType,
  MessageWithRelations,
  PublicChatUser,
  ReplyPreview
} from '@/constants/chat.constants'

const GROUP_TYPES = ['global', 'contract_chat', 'guest_support'] as EChatGroupType[]
// const MESSAGE_TYPES = ['text', 'image', 'file', 'system'] as EMessageType[]

const requireValidId = (id: string, label: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${label}`)
  }
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

const ensureMember = async (groupId: string, userId: string): Promise<void> => {
  requireValidId(groupId, 'group id')
  requireValidId(userId, 'user id')
  const member = await ChatMember.findOne({ group_id: groupId, user_id: userId }).lean()
  if (!member) {
    throw new Error('You are not a member of this group')
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

const formatReply = (reply: unknown): ReplyPreview | null => {
  if (!reply || typeof reply !== 'object') return null
  const r = reply as {
    _id: { toString(): string }
    content: string
    createdAt: Date
    sender_id: unknown
  }
  return {
    _id: r._id.toString(),
    content: r.content,
    senderId: toPublicUser(r.sender_id),
    createdAt: r.createdAt
  }
}

const toMessageWithRelations = (doc: unknown): MessageWithRelations => {
  const m = doc as {
    _id: { toString(): string }
    group_id: { toString(): string }
    sender_id: unknown
    type: EMessageType
    content: string
    reply_to: unknown
    createdAt: Date
  }
  return {
    _id: m._id.toString(),
    groupId: m.group_id.toString(),
    senderId: toPublicUser(m.sender_id),
    type: m.type,
    content: m.content,
    replyTo: formatReply(m.reply_to),
    createdAt: m.createdAt
  }
}

export const chatService = {
  async createGroup(creatorUserId: string, body: CreateChatGroupBody) {
    requireValidId(creatorUserId, 'user id')

    if (!body.type || !GROUP_TYPES.includes(body.type)) {
      throw new Error('Invalid group type')
    }

    if (body.type === 'contract_chat' && !body.memberId) {
      throw new Error('memberId is required for contract_chat')
    }

    if (!Array.isArray(body.memberIds)) {
      throw new Error('memberIds must be an array')
    }

    const memberSet = new Set<string>(body.memberIds.filter((id) => mongoose.Types.ObjectId.isValid(id)))
    memberSet.add(creatorUserId)

    const memberIds = [...memberSet]

    const memberId = body.memberId && mongoose.Types.ObjectId.isValid(body.memberId) ? body.memberId : undefined
    const disputeId = body.disputeId && mongoose.Types.ObjectId.isValid(body.disputeId) ? body.disputeId : undefined

    const group = await ChatGroup.create({
      type: body.type,
      ...(memberId ? { memberId: memberId } : {}),
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

    const populated = await ChatGroup.findById(group._id).populate('lastSenderId', 'fullName avatar').lean()

    if (!populated) {
      throw new Error('Failed to load created group')
    }

    const gid = populated._id.toString()
    const unread_count = await countUnreadForGroup(creatorUserId, gid)

    return {
      _id: gid,
      memberId: populated.memberId ? populated.memberId.toString() : null,
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
      memberId: g.memberId ? g.memberId.toString() : null,
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

  async getMessagesPaginated(userId: string, groupId: string, page: number, limit: number) {
    requireValidId(groupId, 'group id')

    const safePage = Math.max(1, page)
    const safeLimit = Math.min(100, Math.max(1, limit))
    const skip = (safePage - 1) * safeLimit

    const filter = { groupId: groupId }

    const [raw, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .populate('senderId', 'fullName avatar')
        .populate({
          path: 'replyTo',
          select: 'content senderId createdAt',
          populate: { path: 'senderId', select: 'fullName avatar' }
        })
        .lean(),
      Message.countDocuments(filter)
    ])

    const data = raw.map((doc) => toMessageWithRelations(doc as any))

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1
    }
  },

  async listMembers(userId: string, groupId: string): Promise<GroupMemberRow[]> {
    await ensureMember(groupId, userId)
    requireValidId(groupId, 'group id')

    const rows = (await ChatMember.find({ groupId: groupId }).sort({ joinedAt: 1 }).lean()) as any[]
    return rows.map((r) => ({
      _id: r._id.toString(),
      userId: r.userId.toString(),
      role: r.role as EChatMemberRole,
      joinedAt: r.joinedAt
    })) as GroupMemberRow[]
  }
}
