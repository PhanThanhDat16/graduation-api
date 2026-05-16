import { EChatGroupType, EChatGroupStatus } from '@/constants/chat.constants'
import mongoose, { Document } from 'mongoose'

const chatGroupSchema = new mongoose.Schema(
  {
    memberIds: { type: [String], default: [] },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, enum: EChatGroupType, required: true },
    disputeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DisputeForm', default: null },
    guestName: { type: String, default: null },
    assignedStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: null },
    lastSenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: EChatGroupStatus, default: EChatGroupStatus.ACTIVE }
  },
  {
    versionKey: false,
    strict: true,
    collection: 'chat_groups'
  }
)

chatGroupSchema.index({ memberIds: 1 })
chatGroupSchema.index({ disputeId: 1 })
chatGroupSchema.index({ type: 1 })
chatGroupSchema.index({ assignedStaffId: 1 })
chatGroupSchema.index({ lastMessageAt: -1 })

export const ChatGroup = mongoose.model('ChatGroup', chatGroupSchema)

export interface IChatGroup extends Document {
  memberIds: string[]
  ownerId: mongoose.Types.ObjectId | null
  type: EChatGroupType
  disputeId: mongoose.Types.ObjectId | null
  guestName: string | null
  assignedStaffId: mongoose.Types.ObjectId | null
  lastMessage: string
  lastMessageAt: Date | null
  lastSenderId: mongoose.Types.ObjectId | null
  status: EChatGroupStatus
  createdAt: Date
}
