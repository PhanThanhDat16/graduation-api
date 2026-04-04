import mongoose, { Document } from 'mongoose'

export const TRANSACTION_TYPES = ['deposit', 'withdraw', 'escrow_deposit', 'escrow_release', 'refund', 'admin_fee'] as const
export const PAYMENT_METHODS = ['momo', 'vnpay', 'wallet'] as const
export const TRANSACTION_STATUS = ['pending', 'completed', 'failed', 'cancelled'] as const
export const PAYER_TYPES = ['contractor', 'freelancer', 'admin'] as const

const walletTransactionSchema = new mongoose.Schema(
  {
    wallet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    method_payment: { type: String, enum: PAYMENT_METHODS },
    status: { type: String, enum: TRANSACTION_STATUS, default: 'pending' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Contract-related fields (optional)
    contract_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    payer_type: { type: String, enum: PAYER_TYPES },

    // Payment gateway fields from momo
    payment_order_id: { type: String },
    payment_request_id: { type: String },
    payment_order_info: { type: String },
    
    description: { type: String }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: { createdAt: true, updatedAt: true }
  }
)

walletTransactionSchema.index({ wallet_id: 1, type: 1, status: 1, user_id: 1, method_payment: 1, contract_id: 1 })

export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema)

export interface IWalletTransaction extends Document {
  wallet_id: mongoose.Types.ObjectId
  amount: number
  type: (typeof TRANSACTION_TYPES)[number]
  method_payment?: (typeof PAYMENT_METHODS)[number]
  status: (typeof TRANSACTION_STATUS)[number]
  user_id?: mongoose.Types.ObjectId
  contract_id?: mongoose.Types.ObjectId
  payer_type?: (typeof PAYER_TYPES)[number]
  description?: string
  createdAt: Date
  payment_order_id?: string
  payment_request_id?: string
  payment_order_info?: string

}
