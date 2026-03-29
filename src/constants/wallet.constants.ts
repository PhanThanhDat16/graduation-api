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
  method_payment?: EPaymentMethod
  status?: ETransactionStatus
  user_id?: string
}

export interface WithdrawRequestFilter {
  status?: EWithdrawStatus
  user_id?: string
}

export interface ICreateTransaction {
  wallet_id: string
  amount: number
  type: ETransactionType
  method_payment?: EPaymentMethod
  status?: ETransactionStatus
  user_id?: string
  contract_id?: string
  payer_type?: EPayerType
  description?: string
}

export interface ICreateWithdrawRequest {
  user_id: string
  amount: number
}

export interface IUpdateWithdrawRequest {
  status: EWithdrawStatus
  admin_id: string
}
