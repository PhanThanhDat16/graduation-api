import mongoose from 'mongoose'
import { Wallet } from '@/models/wallet.model'
import { WalletTransaction } from '@/models/wallet_transaction.model'
import { WithdrawRequest } from '@/models/withdraw_request.model'
import Account from '@/models/account.model'
import { paginate } from '@/utils/paginate'
import { PaginationQuery } from '@/constants/pagination.constant'
import { v4 as uuidv4 } from "uuid";
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
const TRANSACTION_FIELDS = '_id wallet_id amount type method_payment status user_id contract_id payer_type payment_order_id description createdAt'
const WITHDRAW_REQUEST_FIELDS = '_id account_id amount status admin_id createdAt processed_at'

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

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`;

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
          payment_order_id: orderId,
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

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`;

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
          payment_order_id: orderId,
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

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`;

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
          payment_order_id: orderId,
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

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`;

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
          payment_order_id: orderId,
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

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`;

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
          payment_order_id: orderId,
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

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`;

  const transaction = await WalletTransaction.create({
    wallet_id: new mongoose.Types.ObjectId(data.wallet_id),
    amount: data.amount,
    type: data.type,
    payment_order_id: orderId,
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
const createWithdrawRequest = async (userId: string, amount: number, accountId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw new Error('Invalid account ID format')
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  const account = await Account.findOne({ _id: accountId, userId })
  if (!account) {
    throw new Error('Bank account not found or does not belong to user')
  }

  const wallet = await getOrCreateWallet(userId)

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance')
  }

  // Check pending request
  const userAccounts = await Account.find({ userId }).select('_id')
  const accountIds = userAccounts.map(a => a._id)
  const pendingRequest = await WithdrawRequest.findOne({ account_id: { $in: accountIds }, status: EWithdrawStatus.PENDING })

  if (pendingRequest) {
    throw new Error('You already have a pending withdraw request')
  }

  const request = await WithdrawRequest.create({
    account_id: new mongoose.Types.ObjectId(accountId),
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

  const userAccounts = await Account.find({ userId }).select('_id')
  const filter: any = { account_id: { $in: userAccounts.map(a => a._id) } }

  if (query.status) {
    filter.status = query.status
  }

  const result = await paginate(WithdrawRequest, filter, { ...query, sortBy: 'createdAt', sortOrder: 'desc' }, WITHDRAW_REQUEST_FIELDS)
  await WithdrawRequest.populate(result.data, { path: 'account_id', populate: { path: 'userId', select: 'name avatar email' } })
  return result
}

// Get all withdraw requests (admin)
const getAllWithdrawRequests = async (query: PaginationQuery & WithdrawRequestFilter) => {
  const filter: any = {}

  if (query.status) {
    filter.status = query.status
  }

  if (query.user_id) {
    const userAccounts = await Account.find({ userId: query.user_id }).select('_id')
    filter.account_id = { $in: userAccounts.map(a => a._id) }
  }

  const result = await paginate(WithdrawRequest, filter, { ...query, sortBy: 'createdAt', sortOrder: 'desc' }, WITHDRAW_REQUEST_FIELDS)
  await WithdrawRequest.populate(result.data, { path: 'account_id', populate: { path: 'userId', select: 'name avatar email' } })
  return result
}

// Process withdraw request (admin)
const processWithdrawRequest = async (requestId: string, status: EWithdrawStatus, adminId: string) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new Error('Invalid request ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new Error('Invalid admin ID format')
  }

  const request = await WithdrawRequest.findById(requestId).populate('account_id')

  if (!request) {
    throw new Error('Withdraw request not found')
  }

  if (request.status !== EWithdrawStatus.PENDING) {
    throw new Error('This request has already been processed')
  }

  const requestUserId = (request.account_id as any)?.userId
  if (!requestUserId) throw new Error('Account owner not found')

  const session = await mongoose.startSession()
  session.startTransaction()

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`;

  try {
    if (status === EWithdrawStatus.APPROVED || status === EWithdrawStatus.PAID) {
      // Deduct from wallet
      const wallet = await Wallet.findOne({ user_id: requestUserId })

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
            payment_order_id: orderId,
            status: ETransactionStatus.COMPLETED,
            user_id: requestUserId
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

  const request = await WithdrawRequest.findById(requestId).populate('account_id')

  if (!request) {
    throw new Error('Withdraw request not found')
  }

  const requestUserId = (request.account_id as any)?.userId?.toString()

  if (requestUserId !== userId) {
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
  getTransactionsByContractId,
}
