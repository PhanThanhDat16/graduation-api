import mongoose from 'mongoose'
import { Contract } from '@/models/contract.model'
import { paginate } from '@/utils/paginate'
import { PaginationQuery } from '@/constants/pagination.constant'
import {
  EContractStatus,
  EEscrowStatus,
  ContractFilter,
  ICreateContract,
  IUpdateContract
} from '@/constants/contract.constants'
import { walletService } from '@/services/wallet/wallet.service'
import { EPayerType } from '@/constants/wallet.constants'

const CONTRACT_FIELDS = `
  _id projectId applicationId contractorId freelancerId
  description contractorTerms freelancerTerms
  totalAmount adminFee freelancerDeposit
  contractorAgreed freelancerAgreed deadline
  contractorPaid freelancerPaid
  contractorPaidAmount freelancerPaidAmount
  deadlinePaid contractorPaidAt freelancerPaidAt
  adminId adminApprovedAt adminRejectionReason
  startAt endAt expandCount expandDeadline
  status totalEscrowAmount
  releasedToFreelancer refundedToContractor refundedToFreelancer adminFeeCollected
  escrowStatus lastUpdatedAt createdAt updatedAt
`

/**
 * Tính số tiền mỗi bên cần đóng
 * - Contractor: totalAmount + adminFee
 * - Freelancer: freelancerDeposit (có thể = 0)
 */
const calculatePaymentAmounts = (contract: any) => {
  return {
    contractorAmount: contract.totalAmount + contract.adminFee,
    freelancerAmount: contract.freelancerDeposit || 0
  }
}

// Create contract
const createContract = async (data: ICreateContract) => {
  if (!mongoose.Types.ObjectId.isValid(data.projectId)) {
    throw new Error('Invalid project ID format')
  }
  if (!mongoose.Types.ObjectId.isValid(data.contractorId)) {
    throw new Error('Invalid contractor ID format')
  }
  if (!mongoose.Types.ObjectId.isValid(data.freelancerId)) {
    throw new Error('Invalid freelancer ID format')
  }

  if (data.contractorId === data.freelancerId) {
    throw new Error('Contractor and freelancer cannot be the same person')
  }

  const contract = await Contract.create({
    projectId: new mongoose.Types.ObjectId(data.projectId),
    applicationId: data.applicationId ? new mongoose.Types.ObjectId(data.applicationId) : undefined,
    contractorId: new mongoose.Types.ObjectId(data.contractorId),
    freelancerId: new mongoose.Types.ObjectId(data.freelancerId),
    description: data.description,
    contractorTerms: data.contractorTerms,
    freelancerTerms: data.freelancerTerms,
    totalAmount: data.totalAmount,
    adminFee: data.adminFee || 0,
    freelancerDeposit: data.freelancerDeposit || 0,
    deadline: data.deadline,
    status: EContractStatus.DRAFT,
    escrowStatus: EEscrowStatus.PENDING
  })

  return contract
}

// Get contract by ID
const getContractById = async (contractId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const contract = await Contract.findById(contractId)
    .populate('projectId', '_id title description')
    .populate('contractorId', '_id fullName email avatar')
    .populate('freelancerId', '_id fullName email avatar')
    .populate('adminId', '_id fullName email')
    .lean()

  if (!contract) {
    throw new Error('Contract not found')
  }

  // Thêm thông tin payment cần đóng
  const paymentInfo = calculatePaymentAmounts(contract)

  return {
    ...contract,
    paymentInfo: {
      contractorMustPay: paymentInfo.contractorAmount,
      freelancerMustPay: paymentInfo.freelancerAmount,
      contractorRemaining: paymentInfo.contractorAmount - (contract.contractorPaidAmount || 0),
      freelancerRemaining: paymentInfo.freelancerAmount - (contract.freelancerPaidAmount || 0)
    }
  }
}

// Get all contracts
const getAllContracts = async (query: PaginationQuery & ContractFilter) => {
  const filter: any = {}

  if (query.status) filter.status = query.status
  if (query.escrowStatus) filter.escrowStatus = query.escrowStatus
  if (query.contractorId) filter.contractorId = new mongoose.Types.ObjectId(query.contractorId)
  if (query.freelancerId) filter.freelancerId = new mongoose.Types.ObjectId(query.freelancerId)
  if (query.projectId) filter.projectId = new mongoose.Types.ObjectId(query.projectId)

  return await paginate(Contract, filter, query, CONTRACT_FIELDS, [
    { path: 'projectId', select: '_id title description' },
    { path: 'contractorId', select: '_id fullName email avatar' },
    { path: 'freelancerId', select: '_id fullName email avatar' }
  ])
}

// Get my contracts
const getMyContracts = async (userId: string, query: PaginationQuery & ContractFilter) => {
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
  if (query.escrowStatus) filter.escrowStatus = query.escrowStatus

  return await paginate(Contract, filter, query, CONTRACT_FIELDS, [
    { path: 'projectId', select: '_id title description' },
    { path: 'contractorId', select: '_id fullName email avatar' },
    { path: 'freelancerId', select: '_id fullName email avatar' }
  ])
}

// Update contract
const updateContract = async (contractId: string, userId: string, data: IUpdateContract) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const contract = await Contract.findById(contractId)
  if (!contract) throw new Error('Contract not found')

  const isContractor = contract.contractorId.toString() === userId
  const isFreelancer = contract.freelancerId.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to update this contract')
  }

  if (contract.status !== EContractStatus.DRAFT && contract.status !== EContractStatus.PENDING_AGREEMENT) {
    throw new Error('Contract cannot be updated in current status')
  }

  const updateData: any = { lastUpdatedAt: new Date() }

  if (data.status !== undefined) updateData.status = data.status

  // Contractor có thể update các field này
  if (isContractor) {
    if (data.description !== undefined) updateData.description = data.description
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount
    if (data.adminFee !== undefined) updateData.adminFee = data.adminFee
    if (data.freelancerDeposit !== undefined) updateData.freelancerDeposit = data.freelancerDeposit
    if (data.deadline !== undefined) updateData.deadline = data.deadline
    if (data.contractorTerms !== undefined) {
      updateData.contractorTerms = data.contractorTerms
      // Reset agreement khi terms thay đổi
      updateData.contractorAgreed = false
      updateData.freelancerAgreed = false
    }
  }

  // Freelancer chỉ có thể update freelancer_terms
  if (isFreelancer && data.freelancerTerms !== undefined) {
    updateData.freelancerTerms = data.freelancerTerms
    updateData.contractorAgreed = false
    updateData.freelancerAgreed = false
  }

  const updatedContract = await Contract.findByIdAndUpdate(contractId, updateData, { new: true }).lean()
  return updatedContract
}

// Agree to contract
const agreeToContract = async (contractId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const contract = await Contract.findById(contractId)
  if (!contract) throw new Error('Contract not found')

  const isContractor = contract.contractorId.toString() === userId
  const isFreelancer = contract.freelancerId.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to agree to this contract')
  }

  if (contract.status !== EContractStatus.DRAFT && contract.status !== EContractStatus.PENDING_AGREEMENT) {
    throw new Error('Contract cannot be agreed in current status')
  }

  const updateData: any = { lastUpdatedAt: new Date() }

  if (isContractor) updateData.contractorAgreed = true
  if (isFreelancer) updateData.freelancerAgreed = true

  // Check if both agreed
  const bothAgreed = (isContractor && contract.freelancerAgreed) || (isFreelancer && contract.contractorAgreed)

  if (bothAgreed) {
    updateData.status = EContractStatus.WAITING_PAYMENT
    updateData.deadlinePaid = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
  } else {
    updateData.status = EContractStatus.PENDING_AGREEMENT
  }

  const updatedContract = await Contract.findByIdAndUpdate(contractId, updateData, { new: true }).lean()
  return updatedContract
}

// Pay for contract
const payForContract = async (contractId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const contract = await Contract.findById(contractId)
  if (!contract) throw new Error('Contract not found')

  const isContractor = contract.contractorId.toString() === userId
  const isFreelancer = contract.freelancerId.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to pay for this contract')
  }

  if (contract.status !== EContractStatus.WAITING_PAYMENT) {
    throw new Error('Contract is not in waiting payment status')
  }

  const paymentAmounts = calculatePaymentAmounts(contract)
  let depositAmount = 0
  let payerType: EPayerType

  if (isContractor) {
    if (contract.contractorPaid) {
      throw new Error('You have already paid')
    }
    depositAmount = paymentAmounts.contractorAmount
    payerType = EPayerType.CONTRACTOR
  } else {
    if (contract.freelancerPaid) {
      throw new Error('You have already paid')
    }
    depositAmount = paymentAmounts.freelancerAmount
    payerType = EPayerType.FREELANCER

    // Nếu freelancer không cần đóng tiền
    if (depositAmount === 0) {
      const updateData: any = {
        freelancerPaid: true,
        freelancerPaidAt: new Date(),
        freelancerPaidAmount: 0,
        lastUpdatedAt: new Date()
      }

      // Check if both paid
      if (contract.contractorPaid) {
        updateData.status = EContractStatus.RUNNING
        updateData.escrowStatus = EEscrowStatus.FUNDED
        updateData.startAt = new Date()
      }

      return await Contract.findByIdAndUpdate(contractId, updateData, { new: true }).lean()
    }
  }

  // Trừ tiền từ wallet (transaction is recorded automatically)
  const otherUserId = isContractor ? contract.freelancerId.toString() : contract.contractorId.toString()
  await walletService.escrowDeposit(userId, depositAmount, otherUserId, {
    contractId: contractId,
    payerType: payerType,
    description: `Escrow deposit for contract`
  })

  // Update contract
  const updateData: any = {
    lastUpdatedAt: new Date(),
    totalEscrowAmount: contract.totalEscrowAmount + depositAmount
  }

  if (isContractor) {
    updateData.contractorPaid = true
    updateData.contractorPaidAt = new Date()
    updateData.contractorPaidAmount = depositAmount
  } else {
    updateData.freelancerPaid = true
    updateData.freelancerPaidAt = new Date()
    updateData.freelancerPaidAmount = depositAmount
  }

  // Check if both paid (hoặc freelancer không cần pay)
  const freelancerNeedsPay = paymentAmounts.freelancerAmount > 0
  const bothPaid = isContractor
    ? (!freelancerNeedsPay || contract.freelancerPaid)
    : contract.contractorPaid

  if (bothPaid) {
    updateData.status = EContractStatus.RUNNING
    updateData.escrowStatus = EEscrowStatus.FUNDED
    updateData.startAt = new Date()
  } else {
    updateData.escrowStatus = EEscrowStatus.PARTIAL
  }

  const updatedContract = await Contract.findByIdAndUpdate(contractId, updateData, { new: true }).lean()
  return updatedContract
}

// Submit contract (freelancer hoàn thành công việc)
const submitContract = async (contractId: string, freelancerId: string, submitData?: { githubLink?: string; webLink?: string }) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const contract = await Contract.findById(contractId)
  if (!contract) throw new Error('Contract not found')

  if (contract.freelancerId.toString() !== freelancerId) {
    throw new Error('Only freelancer can submit the contract')
  }

  if (contract.status !== EContractStatus.RUNNING) {
    throw new Error('Contract is not in running status')
  }

  const updateData: any = {
    status: EContractStatus.SUBMITTED,
    lastUpdatedAt: new Date(),
    submittedAt: new Date()
  }

  if (submitData?.githubLink) {
    updateData.githubLink = submitData.githubLink
  }

  if (submitData?.webLink) {
    updateData.webLink = submitData.webLink
  }

  const updatedContract = await Contract.findByIdAndUpdate(
    contractId,
    updateData,
    { new: true }
  ).lean()

  return updatedContract
}

// Complete contract (contractor chấp nhận công việc)
const completeContract = async (contractId: string, contractorId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const contract = await Contract.findById(contractId)
  if (!contract) throw new Error('Contract not found')

  if (contract.contractorId.toString() !== contractorId) {
    throw new Error('Only contractor can complete the contract')
  }

  if (contract.status !== EContractStatus.SUBMITTED) {
    throw new Error('Contract is not in submitted status')
  }

  // 1. Release totalAmount cho freelancer
  const releaseAmount = contract.totalAmount
  await walletService.escrowRelease(
    contract.freelancerId.toString(),
    releaseAmount,
    contract.contractorId.toString(),
    {
      contractId: contractId,
      payerType: EPayerType.FREELANCER,
      description: 'Contract completed - payment release'
    }
  )

  // 2. Hoàn lại freelancerDeposit nếu có
  const freelancerDepositRefund = contract.freelancerPaidAmount || 0
  if (freelancerDepositRefund > 0) {
    await walletService.refund(
      contract.freelancerId.toString(),
      freelancerDepositRefund,
      contract.contractorId.toString(),
      {
        contractId: contractId,
        payerType: EPayerType.FREELANCER,
        description: 'Contract completed - deposit refund'
      }
    )
  }

  // 3. Admin fee (tạm thời chỉ track, không chuyển đi đâu)
  const adminFeeAmount = contract.adminFee

  const updatedContract = await Contract.findByIdAndUpdate(
    contractId,
    {
      status: EContractStatus.COMPLETED,
      escrowStatus: EEscrowStatus.RELEASED,
      releasedToFreelancer: releaseAmount,
      refundedToFreelancer: freelancerDepositRefund,
      adminFeeCollected: adminFeeAmount,
      endAt: new Date(),
      lastUpdatedAt: new Date()
    },
    { new: true }
  ).lean()

  return updatedContract
}

// Cancel contract (chỉ trong giai đoạn đầu)
const cancelContract = async (contractId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const contract = await Contract.findById(contractId)
  if (!contract) throw new Error('Contract not found')

  const isContractor = contract.contractorId.toString() === userId
  const isFreelancer = contract.freelancerId.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to cancel this contract')
  }

  // Chỉ cho phép cancel trong các status này
  const allowedStatuses = [EContractStatus.DRAFT, EContractStatus.PENDING_AGREEMENT, EContractStatus.WAITING_PAYMENT]
  if (!allowedStatuses.includes(contract.status as EContractStatus)) {
    throw new Error('Contract cannot be cancelled in current status. Please open a dispute.')
  }

  // Refund nếu đã có ai đó pay
  if (contract.contractorPaid && contract.contractorPaidAmount > 0) {
    await walletService.refund(
      contract.contractorId.toString(),
      contract.contractorPaidAmount,
      contract.freelancerId.toString(),
      {
        contractId: contractId,
        payerType: EPayerType.CONTRACTOR,
        description: 'Contract cancelled - refund'
      }
    )
  }

  if (contract.freelancerPaid && contract.freelancerPaidAmount > 0) {
    await walletService.refund(
      contract.freelancerId.toString(),
      contract.freelancerPaidAmount,
      contract.contractorId.toString(),
      {
        contractId: contractId,
        payerType: EPayerType.FREELANCER,
        description: 'Contract cancelled - refund'
      }
    )
  }

  const updatedContract = await Contract.findByIdAndUpdate(
    contractId,
    {
      status: EContractStatus.CANCELLED,
      escrowStatus: contract.totalEscrowAmount > 0 ? EEscrowStatus.REFUNDED : EEscrowStatus.PENDING,
      refundedToContractor: contract.contractorPaidAmount || 0,
      refundedToFreelancer: contract.freelancerPaidAmount || 0,
      endAt: new Date(),
      lastUpdatedAt: new Date()
    },
    { new: true }
  ).lean()

  return updatedContract
}

// Extend deadline
const extendDeadline = async (contractId: string, userId: string, newDeadline: Date) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const contract = await Contract.findById(contractId)
  if (!contract) throw new Error('Contract not found')

  const isContractor = contract.contractorId.toString() === userId
  const isFreelancer = contract.freelancerId.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to extend this contract')
  }

  if (contract.status !== EContractStatus.RUNNING) {
    throw new Error('Contract is not in running status')
  }

  if (newDeadline <= new Date()) {
    throw new Error('New deadline must be in the future')
  }

  const updatedContract = await Contract.findByIdAndUpdate(
    contractId,
    {
      deadline: newDeadline,
      expandDeadline: newDeadline,
      expandCount: contract.expandCount + 1,
      lastUpdatedAt: new Date()
    },
    { new: true }
  ).lean()

  return updatedContract
}

// Get contract payments (transactions related to this contract)
const getContractPayments = async (contractId: string, query: PaginationQuery) => {
  return await walletService.getTransactionsByContractId(contractId, query)
}

export const contractService = {
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
