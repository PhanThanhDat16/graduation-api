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
  _id project_id application_id contractor_id freelancer_id
  description contractor_terms freelancer_terms
  total_amount admin_fee freelancer_deposit
  contractor_agreed freelancer_agreed deadline
  contractor_paid freelancer_paid
  contractor_paid_amount freelancer_paid_amount
  deadline_paid contractor_paid_at freelancer_paid_at
  admin_id admin_approved_at admin_rejection_reason
  start_at end_at expand_count expand_deadline
  status total_escrow_amount
  released_to_freelancer refunded_to_contractor refunded_to_freelancer admin_fee_collected
  escrow_status last_updated_at createdAt updatedAt
`

/**
 * Tính số tiền mỗi bên cần đóng
 * - Contractor: total_amount + admin_fee
 * - Freelancer: freelancer_deposit (có thể = 0)
 */
const calculatePaymentAmounts = (contract: any) => {
  return {
    contractorAmount: contract.total_amount + contract.admin_fee,
    freelancerAmount: contract.freelancer_deposit || 0
  }
}

// Create contract
const createContract = async (data: ICreateContract) => {
  if (!mongoose.Types.ObjectId.isValid(data.project_id)) {
    throw new Error('Invalid project ID format')
  }
  if (!mongoose.Types.ObjectId.isValid(data.contractor_id)) {
    throw new Error('Invalid contractor ID format')
  }
  if (!mongoose.Types.ObjectId.isValid(data.freelancer_id)) {
    throw new Error('Invalid freelancer ID format')
  }

  if (data.contractor_id === data.freelancer_id) {
    throw new Error('Contractor and freelancer cannot be the same person')
  }

  const contract = await Contract.create({
    project_id: new mongoose.Types.ObjectId(data.project_id),
    application_id: data.application_id ? new mongoose.Types.ObjectId(data.application_id) : undefined,
    contractor_id: new mongoose.Types.ObjectId(data.contractor_id),
    freelancer_id: new mongoose.Types.ObjectId(data.freelancer_id),
    description: data.description,
    contractor_terms: data.contractor_terms,
    freelancer_terms: data.freelancer_terms,
    total_amount: data.total_amount,
    admin_fee: data.admin_fee || 0,
    freelancer_deposit: data.freelancer_deposit || 0,
    deadline: data.deadline,
    status: EContractStatus.DRAFT,
    escrow_status: EEscrowStatus.PENDING
  })

  return contract
}

// Get contract by ID
const getContractById = async (contractId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const contract = await Contract.findById(contractId)
    .populate('contractor_id', '_id fullName email avatar')
    .populate('freelancer_id', '_id fullName email avatar')
    .populate('admin_id', '_id fullName email')
    .lean()

  if (!contract) {
    throw new Error('Contract not found')
  }

  // Thêm thông tin payment cần đóng
  const paymentInfo = calculatePaymentAmounts(contract)

  return {
    ...contract,
    payment_info: {
      contractor_must_pay: paymentInfo.contractorAmount,
      freelancer_must_pay: paymentInfo.freelancerAmount,
      contractor_remaining: paymentInfo.contractorAmount - (contract.contractor_paid_amount || 0),
      freelancer_remaining: paymentInfo.freelancerAmount - (contract.freelancer_paid_amount || 0)
    }
  }
}

// Get all contracts
const getAllContracts = async (query: PaginationQuery & ContractFilter) => {
  const filter: any = {}

  if (query.status) filter.status = query.status
  if (query.escrow_status) filter.escrow_status = query.escrow_status
  if (query.contractor_id) filter.contractor_id = new mongoose.Types.ObjectId(query.contractor_id)
  if (query.freelancer_id) filter.freelancer_id = new mongoose.Types.ObjectId(query.freelancer_id)
  if (query.project_id) filter.project_id = new mongoose.Types.ObjectId(query.project_id)

  return await paginate(Contract, filter, query, CONTRACT_FIELDS)
}

// Get my contracts
const getMyContracts = async (userId: string, query: PaginationQuery & ContractFilter) => {
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
  if (query.escrow_status) filter.escrow_status = query.escrow_status

  return await paginate(Contract, filter, query, CONTRACT_FIELDS)
}

// Update contract
const updateContract = async (contractId: string, userId: string, data: IUpdateContract) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const contract = await Contract.findById(contractId)
  if (!contract) throw new Error('Contract not found')

  const isContractor = contract.contractor_id.toString() === userId
  const isFreelancer = contract.freelancer_id.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to update this contract')
  }

  if (contract.status !== EContractStatus.DRAFT && contract.status !== EContractStatus.PENDING_AGREEMENT) {
    throw new Error('Contract cannot be updated in current status')
  }

  const updateData: any = { last_updated_at: new Date() }

  // Contractor có thể update các field này
  if (isContractor) {
    if (data.description !== undefined) updateData.description = data.description
    if (data.total_amount !== undefined) updateData.total_amount = data.total_amount
    if (data.admin_fee !== undefined) updateData.admin_fee = data.admin_fee
    if (data.freelancer_deposit !== undefined) updateData.freelancer_deposit = data.freelancer_deposit
    if (data.deadline !== undefined) updateData.deadline = data.deadline
    if (data.contractor_terms !== undefined) {
      updateData.contractor_terms = data.contractor_terms
      // Reset agreement khi terms thay đổi
      updateData.contractor_agreed = false
      updateData.freelancer_agreed = false
    }
  }

  // Freelancer chỉ có thể update freelancer_terms
  if (isFreelancer && data.freelancer_terms !== undefined) {
    updateData.freelancer_terms = data.freelancer_terms
    updateData.contractor_agreed = false
    updateData.freelancer_agreed = false
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

  const isContractor = contract.contractor_id.toString() === userId
  const isFreelancer = contract.freelancer_id.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to agree to this contract')
  }

  if (contract.status !== EContractStatus.DRAFT && contract.status !== EContractStatus.PENDING_AGREEMENT) {
    throw new Error('Contract cannot be agreed in current status')
  }

  const updateData: any = { last_updated_at: new Date() }

  if (isContractor) updateData.contractor_agreed = true
  if (isFreelancer) updateData.freelancer_agreed = true

  // Check if both agreed
  const bothAgreed = (isContractor && contract.freelancer_agreed) || (isFreelancer && contract.contractor_agreed)

  if (bothAgreed) {
    updateData.status = EContractStatus.WAITING_PAYMENT
    updateData.deadline_paid = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
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

  const isContractor = contract.contractor_id.toString() === userId
  const isFreelancer = contract.freelancer_id.toString() === userId

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
    if (contract.contractor_paid) {
      throw new Error('You have already paid')
    }
    depositAmount = paymentAmounts.contractorAmount
    payerType = EPayerType.CONTRACTOR
  } else {
    if (contract.freelancer_paid) {
      throw new Error('You have already paid')
    }
    depositAmount = paymentAmounts.freelancerAmount
    payerType = EPayerType.FREELANCER

    // Nếu freelancer không cần đóng tiền
    if (depositAmount === 0) {
      const updateData: any = {
        freelancer_paid: true,
        freelancer_paid_at: new Date(),
        freelancer_paid_amount: 0,
        last_updated_at: new Date()
      }

      // Check if both paid
      if (contract.contractor_paid) {
        updateData.status = EContractStatus.RUNNING
        updateData.escrow_status = EEscrowStatus.FUNDED
        updateData.start_at = new Date()
      }

      return await Contract.findByIdAndUpdate(contractId, updateData, { new: true }).lean()
    }
  }

  // Trừ tiền từ wallet (transaction is recorded automatically)
  const otherUserId = isContractor ? contract.freelancer_id.toString() : contract.contractor_id.toString()
  await walletService.escrowDeposit(userId, depositAmount, otherUserId, {
    contract_id: contractId,
    payer_type: payerType,
    description: `Escrow deposit for contract`
  })

  // Update contract
  const updateData: any = {
    last_updated_at: new Date(),
    total_escrow_amount: contract.total_escrow_amount + depositAmount
  }

  if (isContractor) {
    updateData.contractor_paid = true
    updateData.contractor_paid_at = new Date()
    updateData.contractor_paid_amount = depositAmount
  } else {
    updateData.freelancer_paid = true
    updateData.freelancer_paid_at = new Date()
    updateData.freelancer_paid_amount = depositAmount
  }

  // Check if both paid (hoặc freelancer không cần pay)
  const freelancerNeedsPay = paymentAmounts.freelancerAmount > 0
  const bothPaid = isContractor
    ? (!freelancerNeedsPay || contract.freelancer_paid)
    : contract.contractor_paid

  if (bothPaid) {
    updateData.status = EContractStatus.RUNNING
    updateData.escrow_status = EEscrowStatus.FUNDED
    updateData.start_at = new Date()
  } else {
    updateData.escrow_status = EEscrowStatus.PARTIAL
  }

  const updatedContract = await Contract.findByIdAndUpdate(contractId, updateData, { new: true }).lean()
  return updatedContract
}

// Submit contract (freelancer hoàn thành công việc)
const submitContract = async (contractId: string, freelancerId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const contract = await Contract.findById(contractId)
  if (!contract) throw new Error('Contract not found')

  if (contract.freelancer_id.toString() !== freelancerId) {
    throw new Error('Only freelancer can submit the contract')
  }

  if (contract.status !== EContractStatus.RUNNING) {
    throw new Error('Contract is not in running status')
  }

  const updatedContract = await Contract.findByIdAndUpdate(
    contractId,
    { status: EContractStatus.SUBMITTED, last_updated_at: new Date() },
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

  if (contract.contractor_id.toString() !== contractorId) {
    throw new Error('Only contractor can complete the contract')
  }

  if (contract.status !== EContractStatus.SUBMITTED) {
    throw new Error('Contract is not in submitted status')
  }

  // 1. Release total_amount cho freelancer
  const releaseAmount = contract.total_amount
  await walletService.escrowRelease(
    contract.freelancer_id.toString(),
    releaseAmount,
    contract.contractor_id.toString(),
    {
      contract_id: contractId,
      payer_type: EPayerType.FREELANCER,
      description: 'Contract completed - payment release'
    }
  )

  // 2. Hoàn lại freelancer_deposit nếu có
  const freelancerDepositRefund = contract.freelancer_paid_amount || 0
  if (freelancerDepositRefund > 0) {
    await walletService.refund(
      contract.freelancer_id.toString(),
      freelancerDepositRefund,
      contract.contractor_id.toString(),
      {
        contract_id: contractId,
        payer_type: EPayerType.FREELANCER,
        description: 'Contract completed - deposit refund'
      }
    )
  }

  // 3. Admin fee (tạm thời chỉ track, không chuyển đi đâu)
  const adminFeeAmount = contract.admin_fee

  const updatedContract = await Contract.findByIdAndUpdate(
    contractId,
    {
      status: EContractStatus.COMPLETED,
      escrow_status: EEscrowStatus.RELEASED,
      released_to_freelancer: releaseAmount,
      refunded_to_freelancer: freelancerDepositRefund,
      admin_fee_collected: adminFeeAmount,
      end_at: new Date(),
      last_updated_at: new Date()
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

  const isContractor = contract.contractor_id.toString() === userId
  const isFreelancer = contract.freelancer_id.toString() === userId

  if (!isContractor && !isFreelancer) {
    throw new Error('You are not authorized to cancel this contract')
  }

  // Chỉ cho phép cancel trong các status này
  const allowedStatuses = [EContractStatus.DRAFT, EContractStatus.PENDING_AGREEMENT, EContractStatus.WAITING_PAYMENT]
  if (!allowedStatuses.includes(contract.status as EContractStatus)) {
    throw new Error('Contract cannot be cancelled in current status. Please open a dispute.')
  }

  // Refund nếu đã có ai đó pay
  if (contract.contractor_paid && contract.contractor_paid_amount > 0) {
    await walletService.refund(
      contract.contractor_id.toString(),
      contract.contractor_paid_amount,
      contract.freelancer_id.toString(),
      {
        contract_id: contractId,
        payer_type: EPayerType.CONTRACTOR,
        description: 'Contract cancelled - refund'
      }
    )
  }

  if (contract.freelancer_paid && contract.freelancer_paid_amount > 0) {
    await walletService.refund(
      contract.freelancer_id.toString(),
      contract.freelancer_paid_amount,
      contract.contractor_id.toString(),
      {
        contract_id: contractId,
        payer_type: EPayerType.FREELANCER,
        description: 'Contract cancelled - refund'
      }
    )
  }

  const updatedContract = await Contract.findByIdAndUpdate(
    contractId,
    {
      status: EContractStatus.CANCELLED,
      escrow_status: contract.total_escrow_amount > 0 ? EEscrowStatus.REFUNDED : EEscrowStatus.PENDING,
      refunded_to_contractor: contract.contractor_paid_amount || 0,
      refunded_to_freelancer: contract.freelancer_paid_amount || 0,
      end_at: new Date(),
      last_updated_at: new Date()
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

  const isContractor = contract.contractor_id.toString() === userId
  const isFreelancer = contract.freelancer_id.toString() === userId

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
      expand_deadline: newDeadline,
      expand_count: contract.expand_count + 1,
      last_updated_at: new Date()
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
