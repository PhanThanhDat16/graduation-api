import mongoose, { Document } from 'mongoose'

const messageReadSchema = new mongoose.Schema(
  {
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readAt: { type: Date, default: () => new Date() }
  },
  {
    versionKey: false,
    strict: true,
    collection: 'message_reads'
  }
)

messageReadSchema.index({ messageId: 1, userId: 1 }, { unique: true })
messageReadSchema.index({ userId: 1 })

export const MessageRead = mongoose.model('MessageRead', messageReadSchema)

export interface IMessageRead extends Document {
  messageId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  readAt: Date
}
