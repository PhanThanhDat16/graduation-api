import { EWithdrawStatus } from '@/constants/wallet.constants'
import mongoose, { Document } from 'mongoose'

const withdrawRequestSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: EWithdrawStatus, default: 'pending' },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    processed_at: { type: Date, default: null }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: { createdAt: true, updatedAt: false }
  }
)

withdrawRequestSchema.index({ user_id: 1, status: 1 })

export const WithdrawRequest = mongoose.model('WithdrawRequest', withdrawRequestSchema)

export interface IWithdrawRequest extends Document {
  user_id: mongoose.Types.ObjectId
  amount: number
  status: EWithdrawStatus
  admin_id?: mongoose.Types.ObjectId
  createdAt: Date
  processed_at?: Date
}
