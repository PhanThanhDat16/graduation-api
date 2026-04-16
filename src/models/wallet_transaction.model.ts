import { EPayerType, EPaymentMethod, ETransactionStatus, ETransactionType } from '@/constants/wallet.constants'
import mongoose, { Document } from 'mongoose'

const walletTransactionSchema = new mongoose.Schema(
  {
    wallet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ETransactionType, required: true },
    method_payment: { type: String, enum: EPaymentMethod },
    status: { type: String, enum: ETransactionStatus, default: 'pending' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Contract-related fields (optional)
    contract_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    payer_type: { type: String, enum: EPayerType },

    // Payment gateway fields from momo
    payment_order_id: { type: String, unique: true },
    payment_request_id: { type: String },
    payment_order_info: { type: String },

    // Payment gateway fields from vnpay
    vnp_ResponseCode: { type: String },
    vnp_TransactionNo: { type: String },
    vnp_PayDate: { type: String },

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
  type: ETransactionType
  method_payment?: EPaymentMethod
  status: ETransactionStatus
  user_id?: mongoose.Types.ObjectId
  contract_id?: mongoose.Types.ObjectId
  payer_type?: EPayerType
  description?: string
  createdAt: Date
  payment_order_id?: string
  payment_request_id?: string
  payment_order_info?: string
  vnp_ResponseCode?: string
  vnp_TransactionNo?: string
  vnp_PayDate?: string
}
