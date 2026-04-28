import mongoose from 'mongoose'

import { ChatMember } from '@/models/chat_member.model'
import { Message } from '@/models/message.model'
import {
  EChatMemberRole,
  GroupMemberRow,
  EMessageType,
  MessageWithRelations,
  PublicChatUser,
  ReplyPreview
} from '@/constants/chat.constants'
import { ChatGroup } from '@/models/chat_group.model'
import { User } from '@/models/user.model'

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
  const member = await ChatMember.findOne({ groupId: groupId, userId: userId }).lean()
  if (!member) {
    throw new Error('You are not a member of this group')
  }
}

const formatReply = (reply: unknown): ReplyPreview | null => {
  if (!reply || typeof reply !== 'object') return null
  const r = reply as {
    _id: { toString(): string }
    content: string
    createdAt: Date
    senderId: unknown
  }
  return {
    _id: r._id.toString(),
    content: r.content,
    senderId: toPublicUser(r.senderId),
    createdAt: r.createdAt
  }
}

const toMessageWithRelations = (doc: unknown): MessageWithRelations => {
  const m = doc as {
    _id: { toString(): string }
    groupId: { toString(): string }
    senderId: unknown
    type: EMessageType
    content: string
    replyTo: unknown
    createdAt: Date
  }
  return {
    _id: m._id.toString(),
    groupId: m.groupId.toString(),
    senderId: toPublicUser(m.senderId),
    type: m.type,
    content: m.content,
    replyTo: formatReply(m.replyTo),
    createdAt: m.createdAt
  }
}

export const chatService = {
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
  },

  // /**
  //  * Unified message save function for both guest and authenticated users
  //  * Guest: Only requires guestName and content
  //  * User: Only requires userId and content (no guestName needed)
  //  * Returns populated MessageWithRelations for Socket.IO emit
  //  */
  async saveMessage(
    groupId: string,
    content: string,
    options: {
      userId?: string // For authenticated users
      guestName?: string // For guests
      type?: string
    } = {}
  ): Promise<MessageWithRelations> {
    const { userId, guestName, type = 'text' } = options

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      throw new Error('Invalid group ID')
    }

    // Verify conversation exists
    const conversation = await ChatGroup.findById(groupId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }

    const isSupport = ['guest_support', 'user_support'].includes(conversation.type)

    // Staff auto-assign and permission check for support conversations
    if (isSupport && userId) {
      const sender = await User.findById(userId).select('role').lean() as any
      if (sender && sender.role === 'staff') {
        if (!conversation.assignedStaffId) {
          // Auto-assign: first staff to reply
          conversation.assignedStaffId = new mongoose.Types.ObjectId(userId)
          await ChatGroup.updateOne(
            { _id: conversation._id },
            {
              $set: { assignedStaffId: new mongoose.Types.ObjectId(userId) },
              $addToSet: { memberIds: userId }
            }
          )
          // Add staff as ChatMember if not already
          await ChatMember.updateOne(
            { groupId: conversation._id, userId: new mongoose.Types.ObjectId(userId) },
            { $setOnInsert: { groupId: conversation._id, userId: new mongoose.Types.ObjectId(userId), role: EChatMemberRole.MEMBER } },
            { upsert: true }
          )
        } else if (conversation.assignedStaffId.toString() !== userId) {
          throw new Error('Only the assigned staff can reply to this conversation')
        }
      }
    }

    const message = await Message.create({
      groupId: groupId,
      senderId: userId,
      senderName: guestName,
      senderType: 'user',
      type,
      content
    } as any)

    // Update chat_group last message
    await ChatGroup.findByIdAndUpdate(groupId, {
      lastMessage: content,
      lastMessageAt: new Date(),
      lastSenderId: userId
    })

    // Populate message with relations for return
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'fullName avatar')
      .populate({
        path: 'replyTo',
        select: 'content senderId createdAt',
        populate: { path: 'senderId', select: 'fullName avatar' }
      })
      .lean()

    // Transform to MessageWithRelations format
    return this.formatMessageWithRelations(populatedMessage as any)
  },

  formatMessageWithRelations(doc: any): MessageWithRelations {
    return {
      _id: doc._id.toString(),
      groupId: doc.groupId.toString(),
      senderId: doc.senderId
        ? {
            _id: doc.senderId._id.toString(),
            full_name: doc.senderId.fullName ?? '',
            avatar: doc.senderId.avatar ?? ''
          }
        : null,
      type: doc.type,
      content: doc.content,
      replyTo: doc.replyTo
        ? {
            _id: doc.replyTo._id.toString(),
            content: doc.replyTo.content,
            senderId: doc.replyTo.senderId
              ? {
                  _id: doc.replyTo.senderId._id.toString(),
                  full_name: doc.replyTo.senderId.fullName ?? '',
                  avatar: doc.replyTo.senderId.avatar ?? ''
                }
              : null,
            createdAt: doc.replyTo.createdAt
          }
        : null,
      createdAt: doc.createdAt
    }
  }
}
