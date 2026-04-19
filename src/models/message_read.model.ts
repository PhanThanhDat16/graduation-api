import mongoose, { Document } from 'mongoose'

const messageReadSchema = new mongoose.Schema(
  {
    message_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    read_at: { type: Date, default: () => new Date() }
  },
  {
    versionKey: false,
    strict: true,
    collection: 'message_reads'
  }
)

messageReadSchema.index({ message_id: 1, user_id: 1 }, { unique: true })
messageReadSchema.index({ user_id: 1 })

export const MessageRead = mongoose.model('MessageRead', messageReadSchema)

export interface IMessageRead extends Document {
  message_id: mongoose.Types.ObjectId
  user_id: mongoose.Types.ObjectId
  read_at: Date
}
