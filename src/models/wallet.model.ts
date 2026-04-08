import mongoose, { Document } from 'mongoose'

const walletSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: true
  }
)

export const Wallet = mongoose.model('Wallet', walletSchema)

export interface IWallet extends Document {
  user_id: mongoose.Types.ObjectId
  balance: number
  createdAt: Date
  updatedAt: Date
}
