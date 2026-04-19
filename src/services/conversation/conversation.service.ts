import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { ChatGroup, IChatGroup } from '@/models/chat_group.model'
import { Message } from '@/models/message.model'
import { User } from '@/models/user.model'
import { MessageWithRelations } from '@/constants/chat.constants'

export interface ConversationResponse {
  group_id: string
  user_id: string | null
  guestName: string | null
  createdAt: Date
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

  /**
   * Unified message save function for both guest and authenticated users
   * Guest: Only requires guestName and content
   * User: Only requires userId and content (no guestName needed)
   * Returns populated MessageWithRelations for Socket.IO emit
   */
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

    // Verify conversation exists and get the guest user
    const conversation = await ChatGroup.findById(groupId).populate('ownerId')
    if (!conversation) {
      throw new Error('Conversation not found')
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
