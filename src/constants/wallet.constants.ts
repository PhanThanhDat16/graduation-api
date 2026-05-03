export enum ETransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  ESCROW_DEPOSIT = 'escrow_deposit',
  ESCROW_RELEASE = 'escrow_release',
  REFUND = 'refund',
  ADMIN_FEE = 'admin_fee'
}

export enum EPayerType {
  CONTRACTOR = 'contractor',
  FREELANCER = 'freelancer',
  ADMIN = 'admin'
}

export enum EPaymentMethod {
  MOMO = 'momo',
  VNPAY = 'vnpay',
  WALLET = 'wallet'
}

export enum ETransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum EWithdrawStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid'
}

export interface WalletTransactionFilter {
  type?: ETransactionType
  methodPayment?: EPaymentMethod
  status?: ETransactionStatus
  userId?: string
}

export interface WithdrawRequestFilter {
  status?: EWithdrawStatus
  userId?: string
}

export interface ICreateTransaction {
  walletId: string
  amount: number
  type: ETransactionType
  methodPayment?: EPaymentMethod
  status?: ETransactionStatus
  userId?: string
  contractId?: string
  payerType?: EPayerType
  description?: string
}

export interface ICreateWithdrawRequest {
  userId: string
  amount: number
}

export interface IUpdateWithdrawRequest {
  status: EWithdrawStatus
  adminId: string
}
