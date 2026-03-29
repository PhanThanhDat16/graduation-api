import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { disputeService } from '@/services/dispute/dispute.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'
import { EResolutionType } from '@/constants/contract.constants'

// Create dispute
const createDispute = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const { contract_id, reason } = req.body

  if (!contract_id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'contract_id is required' })
    return
  }

  const dispute = await disputeService.createDispute({
    contract_id,
    opened_by: userId as string,
    reason
  })

  res.status(HttpStatus.OK).json({
    message: 'Dispute created successfully',
    data: dispute
  })
})

// Get dispute by ID
const getDisputeById = expressAsyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dispute ID is required' })
    return
  }

  const dispute = await disputeService.getDisputeById(id)

  res.status(HttpStatus.OK).json({
    message: 'Get dispute successfully',
    data: dispute
  })
})

// Get all disputes (admin)
const getAllDisputes = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    status: query.status as string | undefined,
    contract_id: query.contract_id as string | undefined,
    contractor_id: query.contractor_id as string | undefined,
    freelancer_id: query.freelancer_id as string | undefined
  }

  const result = await disputeService.getAllDisputes(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all disputes successfully',
    ...result
  })
})

// Get my disputes
const getMyDisputes = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
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

  const result = await disputeService.getMyDisputes(userId as string, filter)

  res.status(HttpStatus.OK).json({
    message: 'Get my disputes successfully',
    ...result
  })
})

// Submit reason
const submitReason = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string
  const { reason, requested_resolution } = req.body

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dispute ID is required' })
    return
  }

  if (!reason) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Reason is required' })
    return
  }

  const dispute = await disputeService.submitReason(id, userId as string, reason, requested_resolution)

  res.status(HttpStatus.OK).json({
    message: 'Reason submitted successfully',
    data: dispute
  })
})

// Propose resolution
const proposeResolution = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string
  const { resolution_type, freelancer_amount, contractor_amount, new_deadline } = req.body

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dispute ID is required' })
    return
  }

  if (!resolution_type || !Object.values(EResolutionType).includes(resolution_type)) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Valid resolution_type is required (extend, cancel, split)' })
    return
  }

  const dispute = await disputeService.proposeResolution(id, userId as string, {
    resolution_type,
    freelancer_amount,
    contractor_amount,
    new_deadline: new_deadline ? new Date(new_deadline) : undefined
  })

  res.status(HttpStatus.OK).json({
    message: 'Resolution proposed successfully',
    data: dispute
  })
})

// Agree to resolution
const agreeToResolution = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dispute ID is required' })
    return
  }

  const dispute = await disputeService.agreeToResolution(id, userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Agreed to resolution successfully',
    data: dispute
  })
})

// Escalate to admin
const escalateToAdmin = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dispute ID is required' })
    return
  }

  const dispute = await disputeService.escalateToAdmin(id, userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Dispute escalated to admin successfully',
    data: dispute
  })
})

// Admin resolve dispute
const adminResolveDispute = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const adminId = req.user?._id
  const id = req.params.id as string
  const { decision, resolution_type, freelancer_amount, contractor_amount, new_deadline } = req.body

  if (!adminId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dispute ID is required' })
    return
  }

  if (!decision || !resolution_type) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Decision and resolution_type are required' })
    return
  }

  const dispute = await disputeService.adminResolveDispute(id, adminId as string, decision, {
    resolution_type,
    freelancer_amount: freelancer_amount || 0,
    contractor_amount: contractor_amount || 0,
    new_deadline: new_deadline ? new Date(new_deadline) : undefined
  })

  res.status(HttpStatus.OK).json({
    message: 'Dispute resolved successfully',
    data: dispute
  })
})

// Get dispute by contract ID
const getDisputeByContractId = expressAsyncHandler(async (req: Request, res: Response) => {
  const contractId = req.params.contractId as string

  if (!contractId) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Contract ID is required' })
    return
  }

  const dispute = await disputeService.getDisputeByContractId(contractId)

  res.status(HttpStatus.OK).json({
    message: 'Get dispute successfully',
    data: dispute
  })
})

export const disputeController = {
  createDispute,
  getDisputeById,
  getAllDisputes,
  getMyDisputes,
  submitReason,
  proposeResolution,
  agreeToResolution,
  escalateToAdmin,
  adminResolveDispute,
  getDisputeByContractId
}
