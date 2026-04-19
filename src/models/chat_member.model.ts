import { EChatMemberRole } from '@/constants/chat.constants'
import mongoose, { Document } from 'mongoose'

const chatMemberSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatGroup', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: EChatMemberRole, required: true },
    joinedAt: { type: Date, default: () => new Date() }
  },
  {
    versionKey: false,
    strict: true,
    collection: 'chat_members'
  }
)

chatMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true })
chatMemberSchema.index({ userId: 1 })

export const ChatMember = mongoose.model('ChatMember', chatMemberSchema)

export interface IChatMember extends Document {
  groupId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  role: EChatMemberRole
  joinedAt: Date
}
