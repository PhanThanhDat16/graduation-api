import { EMessageType } from '@/constants/chat.constants'
import mongoose, { Document } from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatGroup', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    senderType: { type: String, enum: ['user', 'guest', 'staff', 'ai'], required: true, default: 'user' },
    senderName: { type: String, default: null }, // For guest messages
    type: { type: String, enum: EMessageType, required: true },
    content: { type: String, required: true },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: true
  }
)

messageSchema.index({ groupId: 1, createdAt: -1 })
messageSchema.index({ senderId: 1 })

export const Message = mongoose.model('Message', messageSchema)

export interface IMessage extends Document {
  groupId: string
  senderId: string | null
  senderType: 'user' | 'guest' | 'staff' | 'ai'
  senderName: string | null
  type: EMessageType
  content: string
  replyTo: string | null
  createdAt: Date
}
