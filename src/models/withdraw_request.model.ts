import { EWithdrawStatus } from '@/constants/wallet.constants'
import mongoose, { Document } from 'mongoose'

const withdrawRequestSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'AccountBank', required: true },
    amount: { type: Number, required: true, min: 0 },
    amountReceived: { type: Number, required: true, min: 0 },
    status: { type: String, enum: EWithdrawStatus, default: 'pending' },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    processedAt: { type: Date, default: null }
  },
  {
    versionKey: false,
    strict: true,
    collection: 'withdraw_requests',
    timestamps: true
  }
)

withdrawRequestSchema.index({ accountId: 1, status: 1 })

export const WithdrawRequest = mongoose.model('WithdrawRequest', withdrawRequestSchema)

export interface IWithdrawRequest extends Document {
  accountId: mongoose.Types.ObjectId
  amount: number
  amountReceived: number
  status: EWithdrawStatus
  staffId?: mongoose.Types.ObjectId
  createdAt: Date
  processedAt?: Date
}
