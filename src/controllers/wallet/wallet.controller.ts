import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { walletService } from '@/services/wallet/wallet.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'
import { EPaymentMethod, EWithdrawStatus } from '@/constants/wallet.constants'
import { get } from 'axios'

// Get my wallet balance
const getMyBalance = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const result = await walletService.getBalance(userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Get balance successfully',
    data: result
  })
})

// Get my wallet
const getMyWallet = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const wallet = await walletService.getOrCreateWallet(userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Get wallet successfully',
    data: wallet
  })
})

// Deposit to wallet
const deposit = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const { amount, methodPayment } = req.body

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!amount || amount <= 0) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Amount must be greater than 0' })
    return
  }

  if (!methodPayment || !Object.values(EPaymentMethod).includes(methodPayment)) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Valid methodPayment is required (momo, vnpay, wallet)' })
    return
  }

  const result = await walletService.deposit(userId as string, amount, methodPayment)

  res.status(HttpStatus.OK).json({
    message: 'Deposit successfully',
    data: result
  })
})

// Get my transaction history
const getMyTransactions = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const query = req.query

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    type: query.type as string | undefined,
    methodPayment: query.methodPayment as string | undefined,
    status: query.status as string | undefined
  }

  const result = await walletService.getTransactionHistory(userId as string, filter)

  res.status(HttpStatus.OK).json({
    message: 'Get transactions successfully',
    ...result
  })
})

// Create withdraw request
const createWithdrawRequest = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const { amount, accountId } = req.body

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!amount || amount <= 0) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Amount must be greater than 0' })
    return
  }

  if (!accountId) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Account ID is required' })
    return
  }

  const request = await walletService.createWithdrawRequest(userId as string, amount, accountId as string)

  res.status(HttpStatus.OK).json({
    message: 'Withdraw request created successfully',
    data: request
  })
})

// Get my withdraw requests
const getMyWithdrawRequests = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const query = req.query

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    status: query.status as string | undefined
  }

  const result = await walletService.getMyWithdrawRequests(userId as string, filter)

  res.status(HttpStatus.OK).json({
    message: 'Get withdraw requests successfully',
    ...result
  })
})

// Cancel withdraw request
const cancelWithdrawRequest = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Request ID is required' })
    return
  }

  const result = await walletService.cancelWithdrawRequest(id, userId as string)

  res.status(HttpStatus.OK).json(result)
})

// Admin: Get all withdraw requests
const getAllWithdrawRequests = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    status: query.status as string | undefined,
    userId: query.userId as string | undefined
  }

  const result = await walletService.getAllWithdrawRequests(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all withdraw requests successfully',
    ...result
  })
})

// Admin: Process withdraw request
const processWithdrawRequest = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const staffId = req.user?._id
  const role = req.user?.role;
  const id = req.params.id as string
  const { status } = req.body

  if (!staffId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (role !== 'staff') {
    res.status(HttpStatus.FORBIDDEN).json({ message: 'Forbidden' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Request ID is required' })
    return
  }

  if (!status || !Object.values(EWithdrawStatus).includes(status)) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid status' })
    return
  }

  const result = await walletService.processWithdrawRequest(id, status, staffId as string)

  res.status(HttpStatus.OK).json({
    message: 'Withdraw request processed successfully',
    data: result
  })
})

// Admin: Get user wallet
const getUserWallet = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'User ID is required' })
    return
  }

  const wallet = await walletService.getWalletByUserId(userId)

  res.status(HttpStatus.OK).json({
    message: 'Get wallet successfully',
    data: wallet
  })
})

// Admin: Deposit to user wallet
const adminDeposit = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  const { amount, methodPayment } = req.body

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'User ID is required' })
    return
  }

  if (!amount || amount <= 0) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Amount must be greater than 0' })
    return
  }

  const result = await walletService.deposit(userId, amount, methodPayment || EPaymentMethod.WALLET)

  res.status(HttpStatus.OK).json({
    message: 'Deposit successfully',
    data: result
  })
})

// Admin: Get all wallets
const getAllWallets = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query

  const filter = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    userId: query.userId as string | undefined
  }

  const result = await walletService.getAllWallets(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all wallets successfully',
    ...result
  })
})

// Admin: Get all transactions
const getAllTransactions = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    type: query.type as string | undefined,
    methodPayment: query.methodPayment as string | undefined,
    status: query.status as string | undefined,
    userId: query.userId as string | undefined
  }

  const result = await walletService.getAllTransactions(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get transactions successfully',
    ...result
  })
})

// Admin: Get all transactions by userId
const getAllTransactionsByUserId = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId as string
  const query = req.query

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'User ID is required' })
    return
  }

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    type: query.type as string | undefined,
    methodPayment: query.methodPayment as string | undefined,
    status: query.status as string | undefined,
    userId: userId
  }

  const result = await walletService.getAllTransactions(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get transactions successfully',
    ...result
  })
})

// Admin: Get transaction by id
const getTransactionById = expressAsyncHandler(async (req: Request, res: Response) => {
  const transactionId = req.params.id as string

  const transaction = await walletService.getTransactionById(transactionId)

  res.status(HttpStatus.OK).json({
    message: 'Get transaction successfully',
    data: transaction
  })
})

export const walletController = {
  getMyBalance,
  getMyWallet,
  deposit,
  getMyTransactions,
  createWithdrawRequest,
  getMyWithdrawRequests,
  cancelWithdrawRequest,
  getAllWithdrawRequests,
  processWithdrawRequest,
  getUserWallet,
  adminDeposit,
  getAllWallets,
  getAllTransactions,
  getAllTransactionsByUserId,
  getTransactionById
}
