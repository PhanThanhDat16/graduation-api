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

  const { contractId, reason } = req.body

  if (!contractId) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'contractId is required' })
    return
  }

  const dispute = await disputeService.createDispute({
    contractId,
    openedBy: userId as string,
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

// Get all disputes (staff)
const getAllDisputes = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    status: query.status as string | undefined,
    contractId: query.contractId as string | undefined,
    contractorId: query.contractorId as string | undefined,
    freelancerId: query.freelancerId as string | undefined
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
  const { reason, requestedResolution } = req.body

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

  const dispute = await disputeService.submitReason(id, userId as string, reason, requestedResolution)

  res.status(HttpStatus.OK).json({
    message: 'Reason submitted successfully',
    data: dispute
  })
})

// Propose resolution
const proposeResolution = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const id = req.params.id as string
  const { resolutionType, freelancerAmount, contractorAmount, newDeadline } = req.body

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dispute ID is required' })
    return
  }

  if (!resolutionType || !Object.values(EResolutionType).includes(resolutionType)) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Valid resolutionType is required (extend, cancel, split)' })
    return
  }

  const dispute = await disputeService.proposeResolution(id, userId as string, {
    resolutionType,
    freelancerAmount,
    contractorAmount,
    newDeadline: newDeadline ? new Date(newDeadline) : undefined
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

// Escalate dispute — cả 2 bên đều có thể nhấn sau khi hết countdown
const escalateDispute = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
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

  const dispute = await disputeService.escalateDispute(id, userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Dispute escalated successfully',
    data: dispute
  })
})

// Staff join dispute group
const staffJoinDispute = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const staffId = req.user?._id
  const id = req.params.id as string

  if (!staffId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dispute ID is required' })
    return
  }

  const dispute = await disputeService.staffJoinDispute(id, staffId as string)

  res.status(HttpStatus.OK).json({
    message: 'Staff joined dispute group successfully',
    data: dispute
  })
})

// Staff cancel dispute
const staffCancelDispute = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const staffId = req.user?._id
  const id = req.params.id as string
  const { reason } = req.body

  if (!staffId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dispute ID is required' })
    return
  }

  if (!reason) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Cancel reason is required' })
    return
  }

  const dispute = await disputeService.staffCancelDispute(id, staffId as string, reason)

  res.status(HttpStatus.OK).json({
    message: 'Dispute cancelled by staff',
    data: dispute
  })
})

// Check reason deadline (utility endpoint)
const checkReasonDeadline = expressAsyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dispute ID is required' })
    return
  }

  const dispute = await disputeService.checkReasonDeadline(id)

  res.status(HttpStatus.OK).json({
    message: 'Reason deadline checked',
    data: dispute
  })
})

// Staff resolve dispute — Trường hợp 3: cả hai bên không đồng ý
const staffResolveDispute = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const staffId = req.user?._id
  const id = req.params.id as string
  const { decision, resolutionType, freelancerAmount, contractorAmount, newDeadline } = req.body

  if (!staffId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Dispute ID is required' })
    return
  }

  if (!decision || !resolutionType) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'decision and resolutionType are required' })
    return
  }

  const dispute = await disputeService.staffResolveDispute(id, staffId as string, decision, {
    resolutionType,
    freelancerAmount: freelancerAmount || 0,
    contractorAmount: contractorAmount || 0,
    newDeadline: newDeadline ? new Date(newDeadline) : undefined
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
  escalateDispute,
  staffJoinDispute,
  staffCancelDispute,
  checkReasonDeadline,
  staffResolveDispute,
  getDisputeByContractId
}
