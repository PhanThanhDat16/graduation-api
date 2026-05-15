import { EPayerType, EPaymentMethod, ETransactionStatus, ETransactionType } from '@/constants/wallet.constants'
import mongoose, { Document } from 'mongoose'

const walletTransactionSchema = new mongoose.Schema(
  {
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
    amount: { type: Number, required: true },
    adminFee: { type: Number },
    type: { type: String, enum: ETransactionType, required: true },
    methodPayment: { type: String, enum: EPaymentMethod },
    status: { type: String, enum: ETransactionStatus, default: 'pending' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Contract-related fields (optional)
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    payerType: { type: String, enum: EPayerType },

    // Payment gateway fields from momo
    paymentOrderId: { type: String },
    paymentRequestId: { type: String },
    paymentOrderInfo: { type: String },

    // Payment gateway fields from vnpay
    vnp_ResponseCode: { type: String },
    vnp_TransactionNo: { type: String },
    vnp_PayDate: { type: String },

    description: { type: String }
  },
  {
    versionKey: false,
    strict: true,
    collection: 'wallet_transactions',
    timestamps: true
  }
)

walletTransactionSchema.index({ walletId: 1, type: 1, status: 1, userId: 1, methodPayment: 1, contractId: 1 })

export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema)

export interface IWalletTransaction extends Document {
  walletId: mongoose.Types.ObjectId
  amount: number
  type: ETransactionType
  methodPayment?: EPaymentMethod
  status: ETransactionStatus
  userId?: mongoose.Types.ObjectId
  contractId?: mongoose.Types.ObjectId
  payerType?: EPayerType
  description?: string
  createdAt: Date
  paymentOrderId?: string
  paymentRequestId?: string
  paymentOrderInfo?: string
  vnp_ResponseCode?: string
  vnp_TransactionNo?: string
  vnp_PayDate?: string
}
