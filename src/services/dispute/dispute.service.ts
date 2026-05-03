import mongoose from 'mongoose'
import { DisputeForm } from '@/models/dispute_form.model'
import { Contract } from '@/models/contract.model'
import { ChatGroup } from '@/models/chat_group.model'
import { ChatMember } from '@/models/chat_member.model'
import { paginate } from '@/utils/paginate'
import { PaginationQuery } from '@/constants/pagination.constant'
import { EDisputeStatus } from '@/constants/dispute_form.constants'
import {
  EResolutionType,
  EContractStatus,
  EEscrowStatus,
  DisputeFilter,
  ICreateDispute,
  IProposeResolution
} from '@/constants/contract.constants'
import { EChatGroupType, EChatMemberRole } from '@/constants/chat.constants'
import { walletService } from '@/services/wallet/wallet.service'
import { EPayerType } from '@/constants/wallet.constants'

const DISPUTE_FIELDS = `
  _id contractId contractorId freelancerId openedBy status resolutionType
  contractorReason freelancerReason
  contractorRequestedResolution freelancerRequestedResolution
  contractorAgreed freelancerAgreed
  freelancerAmount contractorAmount newDeadline
  reasonDeadline escalatedBy staffId staffCancelReason staffDecision
  escalatedAt createdAt resolvedAt
`

// ─── Helper: tìm ChatGroup contract_chat chứa cả 2 bên ───
const findContractChatGroup = async (contractorId: string, freelancerId: string) => {
  return ChatGroup.findOne({
    type: { $in: [EChatGroupType.CONTRACT_CHAT, EChatGroupType.DISPUTE] },
    memberIds: { $all: [contractorId, freelancerId] }
  })
}

// ═══════════════════════════════════════════════════════════
// 1. Tạo dispute — status = PENDING_REASONS, countdown 1h
// ═══════════════════════════════════════════════════════════
const createDispute = async (data: ICreateDispute) => {
  if (!mongoose.Types.ObjectId.isValid(data.contractId)) {
    throw new Error('Invalid contract ID format')
  }
  if (!mongoose.Types.ObjectId.isValid(data.openedBy)) {
    throw new Error('Invalid user ID format')
  }

  const contract = await Contract.findById(data.contractId)
  if (!contract) throw new Error('Contract not found')

  const isContractor = contract.contractorId.toString() === data.openedBy
  const isFreelancer = contract.freelancerId.toString() === data.openedBy

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to open dispute for this contract')
  }

  // Chỉ cho phép mở dispute khi contract đang running hoặc submitted
  if (contract.status !== EContractStatus.RUNNING && contract.status !== EContractStatus.SUBMITTED) {
    throw new Error('Cannot open dispute in current contract status')
  }

  // Check xem đã có dispute active chưa
  const existingDispute = await DisputeForm.findOne({
    contractId: data.contractId,
    status: {
      $in: [
        EDisputeStatus.PENDING_REASONS,
        EDisputeStatus.WAITING_ESCALATION,
        EDisputeStatus.OPEN,
        EDisputeStatus.NEGOTIATING,
        EDisputeStatus.ADMIN_REVIEW
      ]
    }
  })

  if (existingDispute) {
    throw new Error('An active dispute already exists for this contract')
  }

  // Tạo dispute — status = PENDING_REASONS, countdown 1h
  const disputeData: any = {
    contractId: new mongoose.Types.ObjectId(data.contractId),
    contractorId: contract.contractorId,
    freelancerId: contract.freelancerId,
    openedBy: new mongoose.Types.ObjectId(data.openedBy),
    status: EDisputeStatus.PENDING_REASONS,
    reasonDeadline: new Date(Date.now() + 60 * 60 * 1000) // 1 giờ
  }

  // Thêm reason dựa vào ai mở
  if (isContractor && data.reason) {
    disputeData.contractorReason = data.reason
  }
  if (isFreelancer && data.reason) {
    disputeData.freelancerReason = data.reason
  }

  const dispute = await DisputeForm.create(disputeData)

  // KHÔNG cập nhật contract status ngay — chỉ khi staff join mới đổi

  return dispute
}

// ═══════════════════════════════════════════════════════════
// 2. Submit reason — trong thời gian countdown 1h
// ═══════════════════════════════════════════════════════════
const submitReason = async (disputeId: string, userId: string, reason: string, requestedResolution?: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  const isContractor = dispute.contractorId.toString() === userId
  const isFreelancer = dispute.freelancerId.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to submit reason for this dispute')
  }

  // Chỉ cho phép ở PENDING_REASONS hoặc WAITING_ESCALATION
  if (
    dispute.status !== EDisputeStatus.PENDING_REASONS &&
    dispute.status !== EDisputeStatus.WAITING_ESCALATION
  ) {
    throw new Error('Cannot submit reason in current status')
  }

  const updateData: any = {}

  if (isContractor) {
    updateData.contractorReason = reason
    if (requestedResolution) updateData.contractorRequestedResolution = requestedResolution
  }
  if (isFreelancer) {
    updateData.freelancerReason = reason
    if (requestedResolution) updateData.freelancerRequestedResolution = requestedResolution
  }

  // Nếu cả 2 đã điền reason → tự động chuyển sang WAITING_ESCALATION
  const updatedDispute = await DisputeForm.findByIdAndUpdate(disputeId, updateData, { new: true })
  if (!updatedDispute) throw new Error('Failed to update dispute')

  const bothHaveReasons =
    (isContractor ? reason : updatedDispute.contractorReason) &&
    (isFreelancer ? reason : updatedDispute.freelancerReason)

  if (bothHaveReasons && updatedDispute.status === EDisputeStatus.PENDING_REASONS) {
    await DisputeForm.findByIdAndUpdate(disputeId, { status: EDisputeStatus.WAITING_ESCALATION })
  }

  const finalDispute = await DisputeForm.findById(disputeId).lean()
  return finalDispute
}

// ═══════════════════════════════════════════════════════════
// 3. Check & transition khi hết reason deadline
//    Gọi bởi client hoặc cron job
// ═══════════════════════════════════════════════════════════
const checkReasonDeadline = async (disputeId: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  if (dispute.status !== EDisputeStatus.PENDING_REASONS) {
    return dispute // Không cần làm gì
  }

  // Kiểm tra đã hết deadline chưa
  if (dispute.reasonDeadline && new Date() >= dispute.reasonDeadline) {
    const updatedDispute = await DisputeForm.findByIdAndUpdate(
      disputeId,
      { status: EDisputeStatus.WAITING_ESCALATION },
      { new: true }
    ).lean()
    return updatedDispute
  }

  return dispute
}

// ═══════════════════════════════════════════════════════════
// 4. Escalate dispute — Ai đó nhấn button Dispute
//    Chuyển từ WAITING_ESCALATION → OPEN
// ═══════════════════════════════════════════════════════════
const escalateDispute = async (disputeId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  const isContractor = dispute.contractorId.toString() === userId
  const isFreelancer = dispute.freelancerId.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to escalate this dispute')
  }

  // Chỉ cho phép khi ở WAITING_ESCALATION
  // Hoặc PENDING_REASONS nếu đã hết deadline
  if (dispute.status === EDisputeStatus.PENDING_REASONS) {
    if (dispute.reasonDeadline && new Date() < dispute.reasonDeadline) {
      throw new Error('Reason deadline has not passed yet. Please wait for the countdown to finish.')
    }
    // Hết deadline → cho phép escalate
  } else if (dispute.status !== EDisputeStatus.WAITING_ESCALATION) {
    throw new Error('Cannot escalate in current status')
  }

  // Chuyển sang OPEN — lúc này staff mới thấy
  const updatedDispute = await DisputeForm.findByIdAndUpdate(
    disputeId,
    {
      status: EDisputeStatus.OPEN,
      escalatedBy: new mongoose.Types.ObjectId(userId),
      escalatedAt: new Date()
    },
    { new: true }
  ).lean()

  // Cập nhật contract status sang DISPUTE
  await Contract.findByIdAndUpdate(dispute.contractId, {
    status: EContractStatus.DISPUTE,
    escrowStatus: EEscrowStatus.LOCKED,
    lastUpdatedAt: new Date()
  })

  return updatedDispute
}

// ═══════════════════════════════════════════════════════════
// 5. Staff join dispute group
//    - Thêm staff vào group chat
//    - Chuyển group type → dispute
//    - Gán disputeId vào group
// ═══════════════════════════════════════════════════════════
const staffJoinDispute = async (disputeId: string, staffId: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }
  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    throw new Error('Invalid staff ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  if (dispute.status !== EDisputeStatus.OPEN) {
    throw new Error('Dispute is not in open status')
  }

  // Tìm ChatGroup contract_chat của 2 bên
  const contractorId = dispute.contractorId.toString()
  const freelancerId = dispute.freelancerId.toString()
  const group = await findContractChatGroup(contractorId, freelancerId)

  if (!group) {
    throw new Error('Contract chat group not found for this dispute')
  }

  // Thêm staff vào group + đổi type sang dispute
  await ChatGroup.findByIdAndUpdate(group._id, {
    $set: {
      type: EChatGroupType.DISPUTE,
      disputeId: new mongoose.Types.ObjectId(disputeId),
      assignedStaffId: new mongoose.Types.ObjectId(staffId)
    },
    $addToSet: { memberIds: staffId }
  })

  // Thêm staff vào ChatMember nếu chưa có
  await ChatMember.updateOne(
    { groupId: group._id, userId: new mongoose.Types.ObjectId(staffId) },
    {
      $setOnInsert: {
        groupId: group._id,
        userId: new mongoose.Types.ObjectId(staffId),
        role: EChatMemberRole.MEMBER
      }
    },
    { upsert: true }
  )

  // Cập nhật dispute: gán staff, chuyển sang NEGOTIATING
  const updatedDispute = await DisputeForm.findByIdAndUpdate(
    disputeId,
    {
      status: EDisputeStatus.NEGOTIATING,
      staffId: new mongoose.Types.ObjectId(staffId)
    },
    { new: true }
  ).lean()

  return updatedDispute
}

// ═══════════════════════════════════════════════════════════
// 6. Staff cancel dispute — phải có lý do
// ═══════════════════════════════════════════════════════════
const staffCancelDispute = async (disputeId: string, staffId: string, cancelReason: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  if (dispute.status !== EDisputeStatus.OPEN) {
    throw new Error('Can only cancel disputes that are in open status')
  }

  if (!cancelReason || cancelReason.trim().length === 0) {
    throw new Error('Cancel reason is required')
  }

  // Cập nhật dispute
  const updatedDispute = await DisputeForm.findByIdAndUpdate(
    disputeId,
    {
      status: EDisputeStatus.STAFF_CANCELLED,
      staffId: new mongoose.Types.ObjectId(staffId),
      staffCancelReason: cancelReason.trim(),
      resolvedAt: new Date()
    },
    { new: true }
  ).lean()

  // Contract quay lại trạng thái trước dispute
  const contract = await Contract.findById(dispute.contractId)
  if (contract) {
    await Contract.findByIdAndUpdate(dispute.contractId, {
      status: EContractStatus.RUNNING,
      escrowStatus: EEscrowStatus.FUNDED,
      lastUpdatedAt: new Date()
    })
  }

  return updatedDispute
}

// ═══════════════════════════════════════════════════════════
// 7. Propose resolution — đề xuất giải pháp
// ═══════════════════════════════════════════════════════════
const proposeResolution = async (disputeId: string, userId: string, data: IProposeResolution) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  const contract = await Contract.findById(dispute.contractId)
  if (!contract) throw new Error('Contract not found')

  const isContractor = dispute.contractorId.toString() === userId
  const isFreelancer = dispute.freelancerId.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to propose resolution')
  }

  if (dispute.status !== EDisputeStatus.NEGOTIATING) {
    throw new Error('Cannot propose resolution in current status')
  }

  // Validate amounts for CANCEL and SPLIT
  if (data.resolutionType === EResolutionType.CANCEL || data.resolutionType === EResolutionType.SPLIT) {
    const totalEscrow = contract.totalEscrowAmount
    const proposedTotal = (data.freelancerAmount || 0) + (data.contractorAmount || 0)

    if (proposedTotal !== totalEscrow) {
      throw new Error(`Total proposed amounts (${proposedTotal}) must equal total escrow (${totalEscrow})`)
    }
  }

  // Validate newDeadline for EXTEND
  if (data.resolutionType === EResolutionType.EXTEND) {
    if (!data.newDeadline) {
      throw new Error('New deadline is required for EXTEND resolution')
    }
    if (new Date(data.newDeadline) <= new Date()) {
      throw new Error('New deadline must be in the future')
    }
  }

  const updateData: any = {
    status: EDisputeStatus.NEGOTIATING,
    resolutionType: data.resolutionType,
    freelancerAmount: data.freelancerAmount || 0,
    contractorAmount: data.contractorAmount || 0,
    newDeadline: data.newDeadline,
    // Reset agreements khi có proposal mới
    contractorAgreed: false,
    freelancerAgreed: false
  }

  // Người propose tự động agree
  if (isContractor) updateData.contractorAgreed = true
  if (isFreelancer) updateData.freelancerAgreed = true

  const updatedDispute = await DisputeForm.findByIdAndUpdate(disputeId, updateData, { new: true }).lean()
  return updatedDispute
}

// ═══════════════════════════════════════════════════════════
// 8. Agree to resolution
//    Nếu cả 2 đồng ý → execute resolution
// ═══════════════════════════════════════════════════════════
const agreeToResolution = async (disputeId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  const isContractor = dispute.contractorId.toString() === userId
  const isFreelancer = dispute.freelancerId.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to agree to this resolution')
  }

  if (dispute.status !== EDisputeStatus.NEGOTIATING) {
    throw new Error('Cannot agree to resolution in current status')
  }

  if (!dispute.resolutionType) {
    throw new Error('No resolution has been proposed')
  }

  const updateData: any = {}

  if (isContractor) updateData.contractorAgreed = true
  if (isFreelancer) updateData.freelancerAgreed = true

  // Check if both agreed
  const bothAgreed = (isContractor && dispute.freelancerAgreed) || (isFreelancer && dispute.contractorAgreed)

  if (bothAgreed) {
    await executeResolution(dispute)
    updateData.status = EDisputeStatus.RESOLVED
    updateData.resolvedAt = new Date()

    // Cập nhật ChatGroup dựa vào resolution type
    await updateChatGroupAfterResolution(dispute)
  }

  const updatedDispute = await DisputeForm.findByIdAndUpdate(disputeId, updateData, { new: true }).lean()
  return updatedDispute
}

// ─── Helper: cập nhật ChatGroup sau khi resolve ───
const updateChatGroupAfterResolution = async (dispute: any) => {
  const contractorId = dispute.contractorId.toString()
  const freelancerId = dispute.freelancerId.toString()
  const group = await findContractChatGroup(contractorId, freelancerId)

  if (!group) return

  if (dispute.resolutionType === EResolutionType.EXTEND) {
    // Trường hợp 1: Tiếp tục dự án
    // Group type → contract_chat, disputeId → null
    await ChatGroup.findByIdAndUpdate(group._id, {
      type: EChatGroupType.CONTRACT_CHAT,
      disputeId: null
    })
  } else if (
    dispute.resolutionType === EResolutionType.CANCEL ||
    dispute.resolutionType === EResolutionType.SPLIT
  ) {
    // Trường hợp 2: Hủy hợp đồng
    // Group type → contract_chat, GIỮ disputeId (lịch sử)
    await ChatGroup.findByIdAndUpdate(group._id, {
      type: EChatGroupType.CONTRACT_CHAT
    })
  }
}

// ─── Execute resolution ───
const executeResolution = async (dispute: any) => {
  const contract = await Contract.findById(dispute.contractId)
  if (!contract) throw new Error('Contract not found')

  const contractId = dispute.contractId.toString()

  switch (dispute.resolutionType) {
    case EResolutionType.EXTEND:
      // Trường hợp 1: Tiếp tục dự án — cập nhật expand_deadline + expand_count
      await Contract.findByIdAndUpdate(dispute.contractId, {
        status: EContractStatus.RUNNING,
        escrowStatus: EEscrowStatus.FUNDED,
        deadline: dispute.newDeadline,
        expandDeadline: dispute.newDeadline,
        expandCount: contract.expandCount + 1,
        lastUpdatedAt: new Date()
      })
      break

    case EResolutionType.CANCEL:
    case EResolutionType.SPLIT:
      // Trường hợp 2: Hủy hợp đồng — chia tiền theo %
      // Trả tiền cho freelancer
      if (dispute.freelancerAmount > 0) {
        await walletService.escrowRelease(
          dispute.freelancerId.toString(),
          dispute.freelancerAmount,
          dispute.contractorId.toString(),
          {
            contractId: contractId,
            payerType: EPayerType.FREELANCER,
            description: `Dispute resolved - ${dispute.resolutionType}`
          }
        )
      }

      // Trả tiền cho contractor
      if (dispute.contractorAmount > 0) {
        await walletService.refund(
          dispute.contractorId.toString(),
          dispute.contractorAmount,
          dispute.freelancerId.toString(),
          {
            contractId: contractId,
            payerType: EPayerType.CONTRACTOR,
            description: `Dispute resolved - ${dispute.resolutionType}`
          }
        )
      }

      await Contract.findByIdAndUpdate(dispute.contractId, {
        status: dispute.resolutionType === EResolutionType.SPLIT ? EContractStatus.COMPLETED : EContractStatus.CANCELLED,
        escrowStatus: dispute.resolutionType === EResolutionType.SPLIT ? EEscrowStatus.SPLIT : EEscrowStatus.REFUNDED,
        releasedToFreelancer: dispute.freelancerAmount,
        refundedToContractor: dispute.contractorAmount,
        endAt: new Date(),
        lastUpdatedAt: new Date()
      })
      break
  }
}

// ═══════════════════════════════════════════════════════════
// 9. Staff resolve dispute — Trường hợp 3
// ═══════════════════════════════════════════════════════════
const staffResolveDispute = async (
  disputeId: string,
  staffId: string,
  decision: string,
  data: IProposeResolution
) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
  if (!dispute) throw new Error('Dispute not found')

  const contract = await Contract.findById(dispute.contractId)
  if (!contract) throw new Error('Contract not found')

  // Cho phép staff resolve khi đang NEGOTIATING hoặc ADMIN_REVIEW
  if (dispute.status !== EDisputeStatus.NEGOTIATING && dispute.status !== EDisputeStatus.ADMIN_REVIEW) {
    throw new Error('Dispute is not in a resolvable status')
  }

  // Validate amounts
  if (data.resolutionType === EResolutionType.CANCEL || data.resolutionType === EResolutionType.SPLIT) {
    const totalEscrow = contract.totalEscrowAmount
    const proposedTotal = (data.freelancerAmount || 0) + (data.contractorAmount || 0)

    if (proposedTotal !== totalEscrow) {
      throw new Error(`Total proposed amounts (${proposedTotal}) must equal total escrow (${totalEscrow})`)
    }
  }

  // Update dispute
  const updatedDispute = await DisputeForm.findByIdAndUpdate(
    disputeId,
    {
      staffId: new mongoose.Types.ObjectId(staffId),
      staffDecision: decision,
      resolutionType: data.resolutionType,
      freelancerAmount: data.freelancerAmount || 0,
      contractorAmount: data.contractorAmount || 0,
      newDeadline: data.newDeadline,
      contractorAgreed: true,
      freelancerAgreed: true,
      status: EDisputeStatus.RESOLVED,
      resolvedAt: new Date()
    },
    { new: true }
  )

  // Execute resolution
  await executeResolution(updatedDispute)

  // Cập nhật ChatGroup
  await updateChatGroupAfterResolution(updatedDispute)

  return updatedDispute
}

// ═══════════════════════════════════════════════════════════
// QUERY helpers
// ═══════════════════════════════════════════════════════════

// Get dispute by ID
const getDisputeById = async (disputeId: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const dispute = await DisputeForm.findById(disputeId)
    .populate('contractorId', '_id fullName email avatar')
    .populate('freelancerId', '_id fullName email avatar')
    .populate('openedBy', '_id fullName email')
    .populate('escalatedBy', '_id fullName email')
    .populate('staffId', '_id fullName email')
    .populate('contractId')
    .lean()

  if (!dispute) throw new Error('Dispute not found')

  // Nếu đang PENDING_REASONS và đã hết deadline → auto chuyển
  if (
    (dispute as any).status === EDisputeStatus.PENDING_REASONS &&
    (dispute as any).reasonDeadline &&
    new Date() >= new Date((dispute as any).reasonDeadline)
  ) {
    await DisputeForm.findByIdAndUpdate(disputeId, { status: EDisputeStatus.WAITING_ESCALATION })
    ;(dispute as any).status = EDisputeStatus.WAITING_ESCALATION
  }

  return dispute
}

// Get all disputes (staff)
const getAllDisputes = async (query: PaginationQuery & DisputeFilter) => {
  const filter: any = {}

  if (query.status) filter.status = query.status
  if (query.contractId) filter.contractId = new mongoose.Types.ObjectId(query.contractId)
  if (query.contractorId) filter.contractorId = new mongoose.Types.ObjectId(query.contractorId)
  if (query.freelancerId) filter.freelancerId = new mongoose.Types.ObjectId(query.freelancerId)

  // Staff chỉ thấy dispute từ status OPEN trở đi (không thấy PENDING_REASONS, WAITING_ESCALATION)
  if (!query.status) {
    filter.status = {
      $nin: [EDisputeStatus.PENDING_REASONS, EDisputeStatus.WAITING_ESCALATION]
    }
  }

  return await paginate(DisputeForm, filter, query, DISPUTE_FIELDS)
}

// Get my disputes
const getMyDisputes = async (userId: string, query: PaginationQuery & DisputeFilter) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const filter: any = {
    $or: [
      { contractorId: new mongoose.Types.ObjectId(userId) },
      { freelancerId: new mongoose.Types.ObjectId(userId) }
    ]
  }

  if (query.status) filter.status = query.status

  return await paginate(DisputeForm, filter, query, DISPUTE_FIELDS)
}

// Get dispute by contract ID
const getDisputeByContractId = async (contractId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const dispute = await DisputeForm.findOne({ contractId: contractId })
    .sort({ createdAt: -1 })
    .populate('contractorId', '_id fullName email avatar')
    .populate('freelancerId', '_id fullName email avatar')
    .populate('openedBy', '_id fullName email')
    .populate('escalatedBy', '_id fullName email')
    .populate('staffId', '_id fullName email')
    .lean()

  return dispute
}

export const disputeService = {
  createDispute,
  getDisputeById,
  getAllDisputes,
  getMyDisputes,
  submitReason,
  checkReasonDeadline,
  escalateDispute,
  staffJoinDispute,
  staffCancelDispute,
  proposeResolution,
  agreeToResolution,
  staffResolveDispute,
  getDisputeByContractId
}
