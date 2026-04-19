import mongoose, { Document } from 'mongoose'

export const WITHDRAW_STATUS = ['pending', 'approved', 'rejected', 'paid'] as const

const withdrawRequestSchema = new mongoose.Schema(
  {
    account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: WITHDRAW_STATUS, default: 'pending' },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    processed_at: { type: Date, default: null }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: { createdAt: true, updatedAt: false }
  }
)

withdrawRequestSchema.index({ account_id: 1, status: 1 })

export const WithdrawRequest = mongoose.model('WithdrawRequest', withdrawRequestSchema)

export interface IWithdrawRequest extends Document {
  account_id: mongoose.Types.ObjectId
  amount: number
  status: (typeof WITHDRAW_STATUS)[number]
  admin_id?: mongoose.Types.ObjectId
  createdAt: Date
  processed_at?: Date
}
