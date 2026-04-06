import { AdminHistoryQuery, ICreateAdminHistory, IUpdateAdminHistory } from '@/constants/admin_history.constants'
import { AdminHistory } from '@/models/admin_history.model'
import { paginate } from '@/utils/paginate'
import mongoose from 'mongoose'

const ADMIN_HISTORY_SAFE_FIELDS = '_id admin_id contract_id dispute_id user_id action note createdAt'

const createAdminHistory = async (data: ICreateAdminHistory) => {
  if (!mongoose.Types.ObjectId.isValid(data.admin_id)) {
    throw new Error('Invalid admin ID format')
  }

  if (data.contract_id && !mongoose.Types.ObjectId.isValid(data.contract_id)) {
    throw new Error('Invalid contract ID format')
  }

  if (data.dispute_id && !mongoose.Types.ObjectId.isValid(data.dispute_id)) {
    throw new Error('Invalid dispute ID format')
  }

  if (data.user_id && !mongoose.Types.ObjectId.isValid(data.user_id)) {
    throw new Error('Invalid user ID format')
  }

  const history = await AdminHistory.create(data as any)

  return history
}

const getAllAdminHistories = async (query: AdminHistoryQuery) => {
  const filter: any = {}

  if (query.admin_id) {
    filter.admin_id = new mongoose.Types.ObjectId(query.admin_id)
  }

  if (query.contract_id) {
    filter.contract_id = new mongoose.Types.ObjectId(query.contract_id)
  }

  if (query.dispute_id) {
    filter.dispute_id = new mongoose.Types.ObjectId(query.dispute_id)
  }

  if (query.user_id) {
    filter.user_id = new mongoose.Types.ObjectId(query.user_id)
  }

  if (query.action) {
    filter.action = query.action
  }

  return await paginate(AdminHistory, filter, query, ADMIN_HISTORY_SAFE_FIELDS)
}

const getAdminHistoryById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid admin history ID format')
  }

  const history = await AdminHistory.findById(id)
    .select(ADMIN_HISTORY_SAFE_FIELDS)
    .populate('admin_id', '_id name email avatar')
    .populate('contract_id', '_id project_id status')
    .populate('dispute_id', '_id status reason')
    .populate('user_id', '_id name email avatar')
    .lean()

  if (!history) {
    throw new Error('Admin history not found')
  }

  return history
}

const getHistoriesByAdminId = async (adminId: string) => {
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new Error('Invalid admin ID format')
  }

  const histories = await AdminHistory.find({ admin_id: new mongoose.Types.ObjectId(adminId) } as any)
    .select(ADMIN_HISTORY_SAFE_FIELDS)
    .populate('contract_id', '_id project_id status')
    .populate('dispute_id', '_id status reason')
    .populate('user_id', '_id name email avatar')
    .sort({ createdAt: -1 })
    .lean()

  return histories || []
}

const getHistoriesByContractId = async (contractId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const histories = await AdminHistory.find({ contract_id: new mongoose.Types.ObjectId(contractId) } as any)
    .select(ADMIN_HISTORY_SAFE_FIELDS)
    .populate('admin_id', '_id name email avatar')
    .sort({ createdAt: -1 })
    .lean()

  return histories || []
}

const getHistoriesByDisputeId = async (disputeId: string) => {
  if (!mongoose.Types.ObjectId.isValid(disputeId)) {
    throw new Error('Invalid dispute ID format')
  }

  const histories = await AdminHistory.find({ dispute_id: new mongoose.Types.ObjectId(disputeId) } as any)
    .select(ADMIN_HISTORY_SAFE_FIELDS)
    .populate('admin_id', '_id name email avatar')
    .sort({ createdAt: -1 })
    .lean()

  return histories || []
}

const getHistoriesByUserId = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const histories = await AdminHistory.find({ user_id: new mongoose.Types.ObjectId(userId) } as any)
    .select(ADMIN_HISTORY_SAFE_FIELDS)
    .populate('admin_id', '_id name email avatar')
    .sort({ createdAt: -1 })
    .lean()

  return histories || []
}

const updateAdminHistory = async (id: string, adminId: string, data: IUpdateAdminHistory) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid admin history ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new Error('Invalid admin ID format')
  }

  const findHistory = await AdminHistory.findById(id)

  if (!findHistory) {
    throw new Error('Admin history not found')
  }

  if (findHistory.admin_id?.toString() !== adminId) {
    throw new Error('You are not authorized to update this history')
  }

  const history = await AdminHistory.findByIdAndUpdate(id, data, { new: true })
    .select(ADMIN_HISTORY_SAFE_FIELDS)
    .lean()

  if (!history) {
    throw new Error('Admin history not found')
  }

  return history
}

const deleteAdminHistory = async (id: string, adminId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid admin history ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new Error('Invalid admin ID format')
  }

  const findHistory = await AdminHistory.findById(id)

  if (!findHistory) {
    throw new Error('Admin history not found')
  }

  if (findHistory.admin_id?.toString() !== adminId) {
    throw new Error('You are not authorized to delete this history')
  }

  await AdminHistory.findByIdAndDelete(id)

  return { message: 'Admin history deleted successfully' }
}

export const adminHistoryService = {
  createAdminHistory,
  getAllAdminHistories,
  getAdminHistoryById,
  getHistoriesByAdminId,
  getHistoriesByContractId,
  getHistoriesByDisputeId,
  getHistoriesByUserId,
  updateAdminHistory,
  deleteAdminHistory
}
