import mongoose from 'mongoose'
import { Wallet } from '@/models/wallet.model'
import { WalletTransaction } from '@/models/wallet_transaction.model'
import { WithdrawRequest } from '@/models/withdraw_request.model'
import AccountBank from '@/models/account_bank.model'
import { paginate } from '@/utils/paginate'
import { PaginationQuery } from '@/constants/pagination.constant'
import { v4 as uuidv4 } from 'uuid'
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
import { User } from '@/models/user.model'
import moment from 'moment'
import transporter from '@/config/nodemailer'
import { generatePaymentReceiptEmail } from '@/utils/email_receipt'

interface ContractTransactionOptions {
  contractId?: string
  payerType?: EPayerType
  description?: string
}

// const WALLET_FIELDS = '_id userId balance createdAt updatedAt'
const TRANSACTION_FIELDS =
  '_id wallet_id amount type method_payment status user_id contract_id payer_type payment_order_id description createdAt'
const WITHDRAW_REQUEST_FIELDS = '_id account_id amount amountReceived status staffId createdAt processed_at'

// Get or create wallet for user
const getOrCreateWallet = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const existingWallet = await Wallet.findOne({ userId: userId }).lean()

  if (existingWallet) {
    return existingWallet
  }

  const newWallet = await Wallet.create({ userId: userId, balance: 0 })
  return {
    _id: newWallet._id,
    userId: newWallet.userId,
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

  const wallet = await Wallet.findOne({ userId: userId }).lean()

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
const deposit = async (userId: string, amount: number, methodPayment: EPaymentMethod, relatedUserId?: string) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`

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
          walletId: wallet._id,
          amount,
          type: ETransactionType.DEPOSIT,
          methodPayment: methodPayment,
          paymentOrderId: orderId,
          status: ETransactionStatus.COMPLETED,
          userId: relatedUserId ? new mongoose.Types.ObjectId(relatedUserId) : undefined
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

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`

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
          walletId: wallet._id,
          amount: -amount,
          type: ETransactionType.WITHDRAW,
          methodPayment: methodPayment || EPaymentMethod.WALLET,
          paymentOrderId: orderId,
          status: ETransactionStatus.COMPLETED,
          userId: relatedUserId ? new mongoose.Types.ObjectId(relatedUserId) : undefined
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

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`

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
          walletId: wallet._id,
          amount: -amount,
          type: ETransactionType.ESCROW_DEPOSIT,
          methodPayment: EPaymentMethod.WALLET,
          paymentOrderId: orderId,
          status: ETransactionStatus.COMPLETED,
          userId: new mongoose.Types.ObjectId(toUserId),
          contractId: options?.contractId ? new mongoose.Types.ObjectId(options.contractId) : undefined,
          payerType: options?.payerType,
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

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`

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
          walletId: wallet._id,
          amount,
          type: ETransactionType.ESCROW_RELEASE,
          methodPayment: EPaymentMethod.WALLET,
          status: ETransactionStatus.COMPLETED,
          paymentOrderId: orderId,
          userId: new mongoose.Types.ObjectId(fromUserId),
          contractId: options?.contractId ? new mongoose.Types.ObjectId(options.contractId) : undefined,
          payerType: options?.payerType,
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
const refund = async (userId: string, amount: number, fromUserId: string, options?: ContractTransactionOptions) => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`

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
          walletId: wallet._id,
          amount,
          type: ETransactionType.REFUND,
          methodPayment: EPaymentMethod.WALLET,
          paymentOrderId: orderId,
          status: ETransactionStatus.COMPLETED,
          userId: new mongoose.Types.ObjectId(fromUserId),
          contractId: options?.contractId ? new mongoose.Types.ObjectId(options.contractId) : undefined,
          payerType: options?.payerType,
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
  if (!mongoose.Types.ObjectId.isValid(data.walletId)) {
    throw new Error('Invalid wallet ID format')
  }

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`

  const transaction = await WalletTransaction.create({
    walletId: new mongoose.Types.ObjectId(data.walletId),
    amount: data.amount,
    type: data.type,
    paymentOrderId: orderId,
    methodPayment: data.methodPayment,
    status: data.status || ETransactionStatus.PENDING,
    userId: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined
  })

  return transaction
}

// Get transaction history for user
const getTransactionHistory = async (userId: string, query: PaginationQuery & WalletTransactionFilter) => {
  const wallet = await getOrCreateWallet(userId)

  const filter: any = { walletId: wallet._id }

  if (query.type) {
    filter.type = query.type
  }

  if (query.methodPayment) {
    filter.methodPayment = query.methodPayment
  }

  if (query.status) {
    filter.status = query.status
  }

  return await paginate(
    WalletTransaction,
    filter,
    { ...query, sortBy: 'createdAt', sortOrder: 'desc' },
    TRANSACTION_FIELDS
  )
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

  const account = await AccountBank.findOne({ _id: accountId, userId })
  if (!account) {
    throw new Error('Bank account not found or does not belong to user')
  }

  const wallet = await getOrCreateWallet(userId)

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance')
  }

  // Check pending request
  const userAccounts = await AccountBank.find({ userId }).select('_id')
  const accountIds = userAccounts.map((a) => a._id)
  const pendingRequest = await WithdrawRequest.findOne({
    accountId: { $in: accountIds },
    status: EWithdrawStatus.PENDING
  })

  if (pendingRequest) {
    throw new Error('You already have a pending withdraw request')
  }

  const fee = amount * 0.02;
  const amountReceived = amount - fee;

  const request = await WithdrawRequest.create({
    accountId: new mongoose.Types.ObjectId(accountId),
    amount,
    amountReceived,
    status: EWithdrawStatus.PENDING
  })

  return request
}

// Get withdraw requests for user
const getMyWithdrawRequests = async (userId: string, query: PaginationQuery & WithdrawRequestFilter) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const userAccounts = await AccountBank.find({ userId }).select('_id')
  const filter: any = { accountId: { $in: userAccounts.map((a) => a._id) } }

  if (query.status) {
    filter.status = query.status
  }

  const result = await paginate(
    WithdrawRequest,
    filter,
    { ...query, sortBy: 'createdAt', sortOrder: 'desc' },
    WITHDRAW_REQUEST_FIELDS
  )
  await WithdrawRequest.populate(result.data, {
    path: 'accountId',
    populate: { path: 'userId', select: 'name avatar email' }
  })
  return result
}

// Get all withdraw requests (admin)
const getAllWithdrawRequests = async (query: PaginationQuery & WithdrawRequestFilter) => {
  const filter: any = {}

  if (query.status) {
    filter.status = query.status
  }

  if (query.userId) {
    const userAccounts = await AccountBank.find({ userId: query.userId }).select('_id')
    filter.accountId = { $in: userAccounts.map((a) => a._id) }
  }

  const result = await paginate(
    WithdrawRequest,
    filter,
    { ...query, sortBy: 'createdAt', sortOrder: 'desc' },
    WITHDRAW_REQUEST_FIELDS
  )
  await WithdrawRequest.populate(result.data, {
    path: 'accountId',
    populate: { path: 'userId', select: 'name avatar email' }
  })
  return result
}

// Process withdraw request (staff)
const processWithdrawRequest = async (requestId: string, status: EWithdrawStatus, staffId: string) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new Error('Invalid request ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    throw new Error('Invalid staff ID format')
  }

  const request = await WithdrawRequest.findById(requestId).populate('accountId')

  if (!request) {
    throw new Error('Withdraw request not found')
  }

  if (request.status !== EWithdrawStatus.PENDING) {
    throw new Error('This request has already been processed')
  }

  // Find the account and populate the user
  const account = await AccountBank.findById(request.accountId).populate('userId')
  
  // type guard for user
  if (!account || !account.userId) {
    throw new Error('User not found')
  }

  const senderName = "FREEWORK";
  const senderAccount = "929686868668";
  const senderBank = "MBBANK";

  const email = (account.userId as any).email;
  const accountName = account.accountName;
  const accountNumber = account.accountNumber;
  const bankName = account.bankShortName;
  const amountRequest = request.amount;
  const amountReceived = request.amountReceived;
  const fee = amountRequest * 0.02;
  const requestId_withdraw = request._id.toString();


  const time = new Date().toLocaleString("vi-VN");

  const requestUserId = (request.accountId as any)?.userId
  if (!requestUserId) throw new Error('Account owner not found')

  const htmlResult = generatePaymentReceiptEmail({
    senderName,
    senderAccount,
    senderBank,
    recipientName:    accountName,
    recipientAccount: accountNumber,
    recipientBank:    bankName,
    transactionId:    request._id.toString(),
    amount:           amountRequest,
    amountReceived,
    fee,
    note:             `${senderName} chuyen tien`,
    time,
    requestId:        requestId_withdraw,
  });

  const mailOptions = {
    from: `"FreeWork" <${process.env.AUTH_EMAIL}>`,
    to: email,
    subject: "Biên Lai Thanh Toán",
    html: htmlResult
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  const orderId = `TRANS-${Date.now()}-${uuidv4().slice(0, 8)}`

  try {
    if (status === EWithdrawStatus.APPROVED || status === EWithdrawStatus.PAID) {
      // Deduct from wallet
      const wallet = await Wallet.findOne({ userId: requestUserId })

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
            walletId: wallet._id,
            amount: -request.amount,
            type: ETransactionType.WITHDRAW,
            methodPayment: EPaymentMethod.WALLET,
            paymentOrderId: orderId,
            status: ETransactionStatus.COMPLETED,
            userId: requestUserId
          }
        ],
        { session }
      )
    }

    const updatedRequest = await WithdrawRequest.findByIdAndUpdate(
      requestId,
      {
        status,
        staffId: new mongoose.Types.ObjectId(staffId),
        processed_at: new Date()
      },
      { new: true, session }
    ).lean()

    await transporter.sendMail(mailOptions as any)

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

  const request = await WithdrawRequest.findById(requestId).populate('accountId')

  if (!request) {
    throw new Error('Withdraw request not found')
  }

  const requestUserId = (request.accountId as any)?.userId?.toString()

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

  const filter = { contractId: new mongoose.Types.ObjectId(contractId) }
  return await paginate(
    WalletTransaction,
    filter,
    { ...query, sortBy: 'createdAt', sortOrder: 'desc' },
    TRANSACTION_FIELDS
  )
}

// Get all wallets (admin)
const getAllWallets = async (query: PaginationQuery & { userId?: string }) => {
  const filter: any = {}

  if (query.userId && mongoose.Types.ObjectId.isValid(query.userId)) {
    filter.userId = new mongoose.Types.ObjectId(query.userId)
  }

  const result = await paginate(
    Wallet,
    filter,
    { ...query, sortBy: 'createdAt', sortOrder: 'desc' },
    '_id userId balance createdAt updatedAt'
  )

  await Wallet.populate(result.data, {
    path: 'userId',
    select: 'fullName email avatar role'
  })

  return result
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
  getAllWallets
}
