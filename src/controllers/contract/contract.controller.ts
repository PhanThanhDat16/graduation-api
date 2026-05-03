import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { contractService } from '@/services/contract/contract.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'

// Create contract
const createContract = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const {
    projectId,
    applicationId,
    freelancerId,
    description,
    contractorTerms,
    freelancerTerms,
    totalAmount,
    adminFee,
    freelancerDeposit,
    deadline
  } = req.body

  if (!projectId || !freelancerId || totalAmount === undefined) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'projectId, freelancerId and totalAmount are required' })
    return
  }

  const contract = await contractService.createContract({
    projectId,
    applicationId,
    contractorId: userId as string,
    freelancerId,
    description,
    contractorTerms,
    freelancerTerms,
    totalAmount,
    adminFee,
    freelancerDeposit,
    deadline: deadline ? new Date(deadline) : undefined
  })

  res.status(HttpStatus.OK).json({
    message: 'Contract created successfully',
    data: contract
  })
})

// Get contract by ID
const getContractById = expressAsyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Contract ID is required' })
    return
  }

  const contract = await contractService.getContractById(id)

  res.status(HttpStatus.OK).json({
    message: 'Get contract successfully',
    data: contract
  })
})

// Get all contracts (admin)
const getAllContracts = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    status: query.status as string | undefined,
    escrowStatus: query.escrowStatus as string | undefined,
    contractorId: query.contractorId as string | undefined,
    freelancerId: query.freelancerId as string | undefined,
    projectId: query.projectId as string | undefined
  }

  const result = await contractService.getAllContracts(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all contracts successfully',
    ...result
  })
})

// Get my contracts
const getMyContracts = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const query = req.query

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    status: query.status as string | undefined,
    escrowStatus: query.escrowStatus as string | undefined
  }

  const result = await contractService.getMyContracts(userId as string, filter)

  res.status(HttpStatus.OK).json({
    message: 'Get my contracts successfully',
    ...result
  })
})

// Update contract
const updateContract = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Contract ID is required' })
    return
  }

  const {
    description,
    contractorTerms,
    freelancerTerms,
    totalAmount,
    adminFee,
    freelancerDeposit,
    deadline,
    status
  } = req.body

  const contract = await contractService.updateContract(id, userId as string, {
    description,
    contractorTerms,
    freelancerTerms,
    totalAmount,
    adminFee,
    freelancerDeposit,
    deadline: deadline ? new Date(deadline) : undefined,
    status
  })

  res.status(HttpStatus.OK).json({
    message: 'Contract updated successfully',
    data: contract
  })
})

// Agree to contract
const agreeToContract = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Contract ID is required' })
    return
  }

  const contract = await contractService.agreeToContract(id, userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Agreed to contract successfully',
    data: contract
  })
})

// Pay for contract
const payForContract = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Contract ID is required' })
    return
  }

  const contract = await contractService.payForContract(id, userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Payment successful',
    data: contract
  })
})

// Submit contract (freelancer)
const submitContract = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string
  const { githubLink, webLink } = req.body

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Contract ID is required' })
    return
  }

  const contract = await contractService.submitContract(id, userId as string, { githubLink, webLink })

  res.status(HttpStatus.OK).json({
    message: 'Contract submitted successfully',
    data: contract
  })
})

// Complete contract (contractor)
const completeContract = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Contract ID is required' })
    return
  }

  const contract = await contractService.completeContract(id, userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Contract completed successfully',
    data: contract
  })
})

// Cancel contract
const cancelContract = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Contract ID is required' })
    return
  }

  const contract = await contractService.cancelContract(id, userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Contract cancelled successfully',
    data: contract
  })
})

// Extend deadline
const extendDeadline = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string
  const { deadline } = req.body

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Contract ID is required' })
    return
  }

  if (!deadline) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'New deadline is required' })
    return
  }

  const contract = await contractService.extendDeadline(id, userId as string, new Date(deadline))

  res.status(HttpStatus.OK).json({
    message: 'Deadline extended successfully',
    data: contract
  })
})

// Get contract payments
const getContractPayments = expressAsyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string
  const query = req.query

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Contract ID is required' })
    return
  }

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10
  }

  const result = await contractService.getContractPayments(id, filter)

  res.status(HttpStatus.OK).json({
    message: 'Get contract payments successfully',
    ...result
  })
})

export const contractController = {
  createContract,
  getContractById,
  getAllContracts,
  getMyContracts,
  updateContract,
  agreeToContract,
  payForContract,
  submitContract,
  completeContract,
  cancelContract,
  extendDeadline,
  getContractPayments
}
