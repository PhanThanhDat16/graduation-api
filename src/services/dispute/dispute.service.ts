import mongoose from 'mongoose'
import { DisputeForm } from '@/models/dispute_form.model'
import { Contract } from '@/models/contract.model'
import { paginate } from '@/utils/paginate'
import { PaginationQuery } from '@/constants/pagination.constant'
import {
  EDisputeStatus,
  EResolutionType,
  EContractStatus,
  EEscrowStatus,
  DisputeFilter,
  ICreateDispute,
  IProposeResolution
} from '@/constants/contract.constants'
import { walletService } from '@/services/wallet/wallet.service'
import { EPayerType } from '@/constants/wallet.constants'

const DISPUTE_FIELDS = `
  _id contract_id contractor_id freelancer_id opened_by status resolution_type
  contractor_reason freelancer_reason
  contractor_requested_resolution freelancer_requested_resolution
  contractor_agreed freelancer_agreed
  freelancer_amount contractor_amount new_deadline
  admin_decision admin_id deadline_send_admin escalated_at
  createdAt resolved_at
`

// Tạo dispute (gộp logic từ contractService.openDispute)
const createDispute = async (data: ICreateDispute) => {
  if (!mongoose.Types.ObjectId.isValid(data.contract_id)) {
    throw new Error('Invalid contract ID format')
  }
  if (!mongoose.Types.ObjectId.isValid(data.opened_by)) {
    throw new Error('Invalid user ID format')
  }

  const contract = await Contract.findById(data.contract_id)
  if (!contract) throw new Error('Contract not found')

  const isContractor = contract.contractor_id.toString() === data.opened_by
  const isFreelancer = contract.freelancer_id.toString() === data.opened_by

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to open dispute for this contract')
  }

  // Chỉ cho phép mở dispute khi contract đang running hoặc submitted
  if (contract.status !== EContractStatus.RUNNING && contract.status !== EContractStatus.SUBMITTED) {
    throw new Error('Cannot open dispute in current contract status')
  }

  // Check xem đã có dispute active chưa
  const existingDispute = await DisputeForm.findOne({
    contract_id: data.contract_id,
    status: { $in: [EDisputeStatus.OPEN, EDisputeStatus.NEGOTIATING, EDisputeStatus.ADMIN_REVIEW] }
  })

  if (existingDispute) {
    throw new Error('An active dispute already exists for this contract')
  }

  // Tạo dispute
  const disputeData: any = {
    contract_id: new mongoose.Types.ObjectId(data.contract_id),
    contractor_id: contract.contractor_id,
    freelancer_id: contract.freelancer_id,
    opened_by: new mongoose.Types.ObjectId(data.opened_by),
    status: EDisputeStatus.OPEN,
    deadline_send_admin: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h
  }

  // Thêm reason dựa vào ai mở
  if (isContractor && data.reason) {
    disputeData.contractor_reason = data.reason
  }
  if (isFreelancer && data.reason) {
    disputeData.freelancer_reason = data.reason
  }

  const dispute = await DisputeForm.create(disputeData)

  // Update contract status
  await Contract.findByIdAndUpdate(data.contract_id, {
    status: EContractStatus.DISPUTE,
    escrow_status: EEscrowStatus.LOCKED,
    last_updated_at: new Date()
  })

  return dispute
}

// Get dispute by ID
const getDisputeById = async (disputeId: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
    .populate('contractor_id', '_id fullName email avatar')
    .populate('freelancer_id', '_id fullName email avatar')
    .populate('opened_by', '_id fullName email')
    .populate('admin_id', '_id fullName email')
    .populate('contract_id')
    .lean()

  if (!dispute) throw new Error('Dispute not found')

  return dispute
}

// Get all disputes (admin)
const getAllDisputes = async (query: PaginationQuery & DisputeFilter) => {
  const filter: any = {}

  if (query.status) filter.status = query.status
  if (query.contract_id) filter.contract_id = new mongoose.Types.ObjectId(query.contract_id)
  if (query.contractor_id) filter.contractor_id = new mongoose.Types.ObjectId(query.contractor_id)
  if (query.freelancer_id) filter.freelancer_id = new mongoose.Types.ObjectId(query.freelancer_id)

  return await paginate(DisputeForm, filter, query, DISPUTE_FIELDS)
}

// Get my disputes
const getMyDisputes = async (userId: string, query: PaginationQuery & DisputeFilter) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const filter: any = {
    $or: [
      { contractor_id: new mongoose.Types.ObjectId(userId) },
      { freelancer_id: new mongoose.Types.ObjectId(userId) }
    ]
  }

  if (query.status) filter.status = query.status

  return await paginate(DisputeForm, filter, query, DISPUTE_FIELDS)
}

// Submit reason
const submitReason = async (disputeId: string, userId: string, reason: string, requestedResolution?: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  const isContractor = dispute.contractor_id.toString() === userId
  const isFreelancer = dispute.freelancer_id.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to submit reason for this dispute')
  }

  if (dispute.status !== EDisputeStatus.OPEN && dispute.status !== EDisputeStatus.NEGOTIATING) {
    throw new Error('Cannot submit reason in current status')
  }

  const updateData: any = { status: EDisputeStatus.NEGOTIATING }

  if (isContractor) {
    updateData.contractor_reason = reason
    if (requestedResolution) updateData.contractor_requested_resolution = requestedResolution
  }
  if (isFreelancer) {
    updateData.freelancer_reason = reason
    if (requestedResolution) updateData.freelancer_requested_resolution = requestedResolution
  }

  const updatedDispute = await DisputeForm.findByIdAndUpdate(disputeId, updateData, { new: true }).lean()
  return updatedDispute
}

// Propose resolution
const proposeResolution = async (disputeId: string, userId: string, data: IProposeResolution) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  const contract = await Contract.findById(dispute.contract_id)
  if (!contract) throw new Error('Contract not found')

  const isContractor = dispute.contractor_id.toString() === userId
  const isFreelancer = dispute.freelancer_id.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to propose resolution')
  }

  if (dispute.status !== EDisputeStatus.OPEN && dispute.status !== EDisputeStatus.NEGOTIATING) {
    throw new Error('Cannot propose resolution in current status')
  }

  // Validate amounts for CANCEL and SPLIT
  if (data.resolution_type === EResolutionType.CANCEL || data.resolution_type === EResolutionType.SPLIT) {
    const totalEscrow = contract.total_escrow_amount
    const proposedTotal = (data.freelancer_amount || 0) + (data.contractor_amount || 0)

    if (proposedTotal !== totalEscrow) {
      throw new Error(`Total proposed amounts (${proposedTotal}) must equal total escrow (${totalEscrow})`)
    }
  }

  // Validate new_deadline for EXTEND
  if (data.resolution_type === EResolutionType.EXTEND) {
    if (!data.new_deadline) {
      throw new Error('New deadline is required for EXTEND resolution')
    }
    if (new Date(data.new_deadline) <= new Date()) {
      throw new Error('New deadline must be in the future')
    }
  }

  const updateData: any = {
    status: EDisputeStatus.NEGOTIATING,
    resolution_type: data.resolution_type,
    freelancer_amount: data.freelancer_amount || 0,
    contractor_amount: data.contractor_amount || 0,
    new_deadline: data.new_deadline,
    // Reset agreements khi có proposal mới
    contractor_agreed: false,
    freelancer_agreed: false
  }

  // Người propose tự động agree
  if (isContractor) updateData.contractor_agreed = true
  if (isFreelancer) updateData.freelancer_agreed = true

  const updatedDispute = await DisputeForm.findByIdAndUpdate(disputeId, updateData, { new: true }).lean()
  return updatedDispute
}

// Agree to resolution
const agreeToResolution = async (disputeId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  const isContractor = dispute.contractor_id.toString() === userId
  const isFreelancer = dispute.freelancer_id.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to agree to this resolution')
  }

  if (dispute.status !== EDisputeStatus.NEGOTIATING) {
    throw new Error('Cannot agree to resolution in current status')
  }

  if (!dispute.resolution_type) {
    throw new Error('No resolution has been proposed')
  }

  const updateData: any = {}

  if (isContractor) updateData.contractor_agreed = true
  if (isFreelancer) updateData.freelancer_agreed = true

  // Check if both agreed
  const bothAgreed = (isContractor && dispute.freelancer_agreed) || (isFreelancer && dispute.contractor_agreed)

  if (bothAgreed) {
    await executeResolution(dispute)
    updateData.status = EDisputeStatus.RESOLVED
    updateData.resolved_at = new Date()
  }

  const updatedDispute = await DisputeForm.findByIdAndUpdate(disputeId, updateData, { new: true }).lean()
  return updatedDispute
}

// Execute resolution
const executeResolution = async (dispute: any) => {
  const contract = await Contract.findById(dispute.contract_id)
  if (!contract) throw new Error('Contract not found')

  const contractId = dispute.contract_id.toString()

  switch (dispute.resolution_type) {
    case EResolutionType.EXTEND:
      await Contract.findByIdAndUpdate(dispute.contract_id, {
        status: EContractStatus.RUNNING,
        escrow_status: EEscrowStatus.FUNDED,
        deadline: dispute.new_deadline,
        expand_deadline: dispute.new_deadline,
        expand_count: contract.expand_count + 1,
        last_updated_at: new Date()
      })
      break

    case EResolutionType.CANCEL:
    case EResolutionType.SPLIT:
      // Trả tiền cho freelancer
      if (dispute.freelancer_amount > 0) {
        await walletService.escrowRelease(
          dispute.freelancer_id.toString(),
          dispute.freelancer_amount,
          dispute.contractor_id.toString(),
          {
            contract_id: contractId,
            payer_type: EPayerType.FREELANCER,
            description: `Dispute resolved - ${dispute.resolution_type}`
          }
        )
      }

      // Trả tiền cho contractor
      if (dispute.contractor_amount > 0) {
        await walletService.refund(
          dispute.contractor_id.toString(),
          dispute.contractor_amount,
          dispute.freelancer_id.toString(),
          {
            contract_id: contractId,
            payer_type: EPayerType.CONTRACTOR,
            description: `Dispute resolved - ${dispute.resolution_type}`
          }
        )
      }

      await Contract.findByIdAndUpdate(dispute.contract_id, {
        status: dispute.resolution_type === EResolutionType.SPLIT ? EContractStatus.COMPLETED : EContractStatus.CANCELLED,
        escrow_status: dispute.resolution_type === EResolutionType.SPLIT ? EEscrowStatus.SPLIT : EEscrowStatus.REFUNDED,
        released_to_freelancer: dispute.freelancer_amount,
        refunded_to_contractor: dispute.contractor_amount,
        end_at: new Date(),
        last_updated_at: new Date()
      })
      break
  }
}

// Escalate to admin
const escalateToAdmin = async (disputeId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  const isContractor = dispute.contractor_id.toString() === userId
  const isFreelancer = dispute.freelancer_id.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to escalate this dispute')
  }

  if (dispute.status !== EDisputeStatus.OPEN && dispute.status !== EDisputeStatus.NEGOTIATING) {
    throw new Error('Cannot escalate in current status')
  }

  const updatedDispute = await DisputeForm.findByIdAndUpdate(
    disputeId,
    { status: EDisputeStatus.ADMIN_REVIEW, escalated_at: new Date() },
    { new: true }
  ).lean()

  return updatedDispute
}

// Admin resolve dispute
const adminResolveDispute = async (
  disputeId: string,
  adminId: string,
  decision: string,
  data: IProposeResolution
) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  const contract = await Contract.findById(dispute.contract_id)
  if (!contract) throw new Error('Contract not found')

  if (dispute.status !== EDisputeStatus.ADMIN_REVIEW) {
    throw new Error('Dispute is not in admin review status')
  }

  // Validate amounts
  if (data.resolution_type === EResolutionType.CANCEL || data.resolution_type === EResolutionType.SPLIT) {
    const totalEscrow = contract.total_escrow_amount
    const proposedTotal = (data.freelancer_amount || 0) + (data.contractor_amount || 0)

    if (proposedTotal !== totalEscrow) {
      throw new Error(`Total proposed amounts (${proposedTotal}) must equal total escrow (${totalEscrow})`)
    }
  }

  // Update dispute
  const updatedDispute = await DisputeForm.findByIdAndUpdate(
    disputeId,
    {
      admin_id: new mongoose.Types.ObjectId(adminId),
      admin_decision: decision,
      resolution_type: data.resolution_type,
      freelancer_amount: data.freelancer_amount || 0,
      contractor_amount: data.contractor_amount || 0,
      new_deadline: data.new_deadline,
      contractor_agreed: true,
      freelancer_agreed: true,
      status: EDisputeStatus.RESOLVED,
      resolved_at: new Date()
    },
    { new: true }
  )

  // Execute resolution
  await executeResolution(updatedDispute)

  return updatedDispute
}

// Get dispute by contract ID
const getDisputeByContractId = async (contractId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const dispute = await DisputeForm.findOne({ contract_id: contractId })
    .sort({ createdAt: -1 })
    .populate('contractor_id', '_id fullName email avatar')
    .populate('freelancer_id', '_id fullName email avatar')
    .populate('opened_by', '_id fullName email')
    .populate('admin_id', '_id fullName email')
    .lean()

  return dispute
}

export const disputeService = {
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
