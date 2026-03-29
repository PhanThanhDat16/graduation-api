import mongoose from 'mongoose'
import { Wallet } from '@/models/wallet.model'
import { WalletTransaction } from '@/models/wallet_transaction.model'
import { WithdrawRequest } from '@/models/withdraw_request.model'
import { paginate } from '@/utils/paginate'
import { PaginationQuery } from '@/constants/pagination.constant'
import {
  ETransactionType,
  EPaymentMethod,
  ETransactionStatus,
  EWithdrawStatus,
  EPayerType,
  WalletTransactionFilter,
  WithdrawRequestFilter,
  ICreateTransaction
} from '@/constants/wallet.constants'

interface ContractTransactionOptions {
  contract_id?: string
  payer_type?: EPayerType
  description?: string
}

// const WALLET_FIELDS = '_id user_id balance createdAt updatedAt'
const TRANSACTION_FIELDS = '_id wallet_id amount type method_payment status user_id contract_id payer_type description createdAt'
const WITHDRAW_REQUEST_FIELDS = '_id user_id amount status admin_id createdAt processed_at'

// Get or create wallet for user
const getOrCreateWallet = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const existingWallet = await Wallet.findOne({ user_id: userId }).lean()

  if (existingWallet) {
    return existingWallet
  }

  const newWallet = await Wallet.create({ user_id: userId, balance: 0 })
  return {
    _id: newWallet._id,
    user_id: newWallet.user_id,
    balance: newWallet.balance,
    createdAt: (newWallet as any).createdAt,
    updatedAt: (newWallet as any).updatedAt
  }
}

// Get wallet by user ID
const getWalletByUserId = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const wallet = await Wallet.findOne({ user_id: userId }).lean()

  if (!wallet) {
    throw new Error('Wallet not found')
  }

  return wallet
}

// Get wallet balance
const getBalance = async (userId: string) => {
  const wallet = await getOrCreateWallet(userId)
  return { balance: wallet.balance }
}

// Deposit money to wallet
const deposit = async (
  userId: string,
  amount: number,
  methodPayment: EPaymentMethod,
  relatedUserId?: string
) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const wallet = await getOrCreateWallet(userId)

    const updatedWallet = await Wallet.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: amount } },
      { new: true, session }
    ).lean()

    if (!updatedWallet) {
      throw new Error('Failed to update wallet')
    }

    const transaction = await WalletTransaction.create(
      [
        {
          wallet_id: wallet._id,
          amount,
          type: ETransactionType.DEPOSIT,
          method_payment: methodPayment,
          status: ETransactionStatus.COMPLETED,
          user_id: relatedUserId ? new mongoose.Types.ObjectId(relatedUserId) : undefined
        }
      ],
      { session }
    )

    await session.commitTransaction()

    return {
      wallet: updatedWallet,
      transaction: transaction[0]
    }
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

// Withdraw money from wallet
const withdraw = async (userId: string, amount: number, methodPayment?: EPaymentMethod, relatedUserId?: string) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const wallet = await getOrCreateWallet(userId)

    if (wallet.balance < amount) {
      throw new Error('Insufficient balance')
    }

    const updatedWallet = await Wallet.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: -amount } },
      { new: true, session }
    ).lean()

    if (!updatedWallet) {
      throw new Error('Failed to update wallet')
    }

    const transaction = await WalletTransaction.create(
      [
        {
          wallet_id: wallet._id,
          amount: -amount,
          type: ETransactionType.WITHDRAW,
          method_payment: methodPayment || EPaymentMethod.WALLET,
          status: ETransactionStatus.COMPLETED,
          user_id: relatedUserId ? new mongoose.Types.ObjectId(relatedUserId) : undefined
        }
      ],
      { session }
    )

    await session.commitTransaction()

    return {
      wallet: updatedWallet,
      transaction: transaction[0]
    }
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

// Escrow deposit (freeze money for contract)
const escrowDeposit = async (
  userId: string,
  amount: number,
  toUserId: string,
  options?: ContractTransactionOptions
) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const wallet = await getOrCreateWallet(userId)

    if (wallet.balance < amount) {
      throw new Error('Insufficient balance')
    }

    const updatedWallet = await Wallet.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: -amount } },
      { new: true, session }
    ).lean()

    if (!updatedWallet) {
      throw new Error('Failed to update wallet')
    }

    const transaction = await WalletTransaction.create(
      [
        {
          wallet_id: wallet._id,
          amount: -amount,
          type: ETransactionType.ESCROW_DEPOSIT,
          method_payment: EPaymentMethod.WALLET,
          status: ETransactionStatus.COMPLETED,
          user_id: new mongoose.Types.ObjectId(toUserId),
          contract_id: options?.contract_id ? new mongoose.Types.ObjectId(options.contract_id) : undefined,
          payer_type: options?.payer_type,
          description: options?.description
        }
      ],
      { session }
    )

    await session.commitTransaction()

    return {
      wallet: updatedWallet,
      transaction: transaction[0]
    }
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

// Escrow release (release money to freelancer)
const escrowRelease = async (
  freelancerUserId: string,
  amount: number,
  fromUserId: string,
  options?: ContractTransactionOptions
) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const wallet = await getOrCreateWallet(freelancerUserId)

    const updatedWallet = await Wallet.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: amount } },
      { new: true, session }
    ).lean()

    if (!updatedWallet) {
      throw new Error('Failed to update wallet')
    }

    const transaction = await WalletTransaction.create(
      [
        {
          wallet_id: wallet._id,
          amount,
          type: ETransactionType.ESCROW_RELEASE,
          method_payment: EPaymentMethod.WALLET,
          status: ETransactionStatus.COMPLETED,
          user_id: new mongoose.Types.ObjectId(fromUserId),
          contract_id: options?.contract_id ? new mongoose.Types.ObjectId(options.contract_id) : undefined,
          payer_type: options?.payer_type,
          description: options?.description
        }
      ],
      { session }
    )

    await session.commitTransaction()

    return {
      wallet: updatedWallet,
      transaction: transaction[0]
    }
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

// Refund money (from dispute)
const refund = async (
  userId: string,
  amount: number,
  fromUserId: string,
  options?: ContractTransactionOptions
) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const wallet = await getOrCreateWallet(userId)

    const updatedWallet = await Wallet.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: amount } },
      { new: true, session }
    ).lean()

    if (!updatedWallet) {
      throw new Error('Failed to update wallet')
    }

    const transaction = await WalletTransaction.create(
      [
        {
          wallet_id: wallet._id,
          amount,
          type: ETransactionType.REFUND,
          method_payment: EPaymentMethod.WALLET,
          status: ETransactionStatus.COMPLETED,
          user_id: new mongoose.Types.ObjectId(fromUserId),
          contract_id: options?.contract_id ? new mongoose.Types.ObjectId(options.contract_id) : undefined,
          payer_type: options?.payer_type,
          description: options?.description
        }
      ],
      { session }
    )

    await session.commitTransaction()

    return {
      wallet: updatedWallet,
      transaction: transaction[0]
    }
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

// Create transaction (internal use)
const createTransaction = async (data: ICreateTransaction) => {
  if (!mongoose.Types.ObjectId.isValid(data.wallet_id)) {
    throw new Error('Invalid wallet ID format')
  }

  const transaction = await WalletTransaction.create({
    wallet_id: new mongoose.Types.ObjectId(data.wallet_id),
    amount: data.amount,
    type: data.type,
    method_payment: data.method_payment,
    status: data.status || ETransactionStatus.PENDING,
    user_id: data.user_id ? new mongoose.Types.ObjectId(data.user_id) : undefined
  })

  return transaction
}

// Get transaction history for user
const getTransactionHistory = async (userId: string, query: PaginationQuery & WalletTransactionFilter) => {
  const wallet = await getOrCreateWallet(userId)

  const filter: any = { wallet_id: wallet._id }

  if (query.type) {
    filter.type = query.type
  }

  if (query.method_payment) {
    filter.method_payment = query.method_payment
  }

  if (query.status) {
    filter.status = query.status
  }

  return await paginate(WalletTransaction, filter, { ...query, sortBy: 'createdAt', sortOrder: 'desc' }, TRANSACTION_FIELDS)
}

// Create withdraw request
const createWithdrawRequest = async (userId: string, amount: number) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  const wallet = await getOrCreateWallet(userId)

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance')
  }

  // Check pending request
  const pendingRequest = await WithdrawRequest.findOne({ user_id: userId, status: EWithdrawStatus.PENDING })

  if (pendingRequest) {
    throw new Error('You already have a pending withdraw request')
  }

  const request = await WithdrawRequest.create({
    user_id: new mongoose.Types.ObjectId(userId),
    amount,
    status: EWithdrawStatus.PENDING
  })

  return request
}

// Get withdraw requests for user
const getMyWithdrawRequests = async (userId: string, query: PaginationQuery & WithdrawRequestFilter) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const filter: any = { user_id: new mongoose.Types.ObjectId(userId) }

  if (query.status) {
    filter.status = query.status
  }

  return await paginate(WithdrawRequest, filter, { ...query, sortBy: 'createdAt', sortOrder: 'desc' }, WITHDRAW_REQUEST_FIELDS)
}

// Get all withdraw requests (admin)
const getAllWithdrawRequests = async (query: PaginationQuery & WithdrawRequestFilter) => {
  const filter: any = {}

  if (query.status) {
    filter.status = query.status
  }

  if (query.user_id) {
    filter.user_id = new mongoose.Types.ObjectId(query.user_id)
  }

  return await paginate(WithdrawRequest, filter, { ...query, sortBy: 'createdAt', sortOrder: 'desc' }, WITHDRAW_REQUEST_FIELDS)
}

// Process withdraw request (admin)
const processWithdrawRequest = async (requestId: string, status: EWithdrawStatus, adminId: string) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new Error('Invalid request ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new Error('Invalid admin ID format')
  }

  const request = await WithdrawRequest.findById(requestId)

  if (!request) {
    throw new Error('Withdraw request not found')
  }

  if (request.status !== EWithdrawStatus.PENDING) {
    throw new Error('This request has already been processed')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    if (status === EWithdrawStatus.APPROVED || status === EWithdrawStatus.PAID) {
      // Deduct from wallet
      const wallet = await Wallet.findOne({ user_id: request.user_id })

      if (!wallet) {
        throw new Error('Wallet not found')
      }

      if (wallet.balance < request.amount) {
        throw new Error('Insufficient balance')
      }

      await Wallet.findByIdAndUpdate(wallet._id, { $inc: { balance: -request.amount } }, { session })

      // Create transaction
      await WalletTransaction.create(
        [
          {
            wallet_id: wallet._id,
            amount: -request.amount,
            type: ETransactionType.WITHDRAW,
            method_payment: EPaymentMethod.WALLET,
            status: ETransactionStatus.COMPLETED,
            user_id: request.user_id
          }
        ],
        { session }
      )
    }

    const updatedRequest = await WithdrawRequest.findByIdAndUpdate(
      requestId,
      {
        status,
        admin_id: new mongoose.Types.ObjectId(adminId),
        processed_at: new Date()
      },
      { new: true, session }
    ).lean()

    await session.commitTransaction()

    return updatedRequest
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

// Cancel withdraw request (user)
const cancelWithdrawRequest = async (requestId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new Error('Invalid request ID format')
  }

  const request = await WithdrawRequest.findById(requestId)

  if (!request) {
    throw new Error('Withdraw request not found')
  }

  if (request.user_id.toString() !== userId) {
    throw new Error('You are not authorized to cancel this request')
  }

  if (request.status !== EWithdrawStatus.PENDING) {
    throw new Error('This request cannot be cancelled')
  }

  await WithdrawRequest.findByIdAndDelete(requestId)

  return { message: 'Withdraw request cancelled successfully' }
}

// Get transactions by contract ID
const getTransactionsByContractId = async (contractId: string, query: PaginationQuery) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const filter = { contract_id: new mongoose.Types.ObjectId(contractId) }
  return await paginate(WalletTransaction, filter, { ...query, sortBy: 'createdAt', sortOrder: 'desc' }, TRANSACTION_FIELDS)
}

export const walletService = {
  getOrCreateWallet,
  getWalletByUserId,
  getBalance,
  deposit,
  withdraw,
  escrowDeposit,
  escrowRelease,
  refund,
  createTransaction,
  getTransactionHistory,
  createWithdrawRequest,
  getMyWithdrawRequests,
  getAllWithdrawRequests,
  processWithdrawRequest,
  cancelWithdrawRequest,
  getTransactionsByContractId
}
