import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { adminHistoryService } from '@/services/admin_history/admin_history.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'

const createAdminHistory = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { contract_id, dispute_id, user_id, action, note } = req.body
  const admin_id = req.user?._id
  const role = req.user?.role

  if (!admin_id || !action || !note || !role) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'admin_id, action and note are required'
    })
    return
  }

  if (role !== 'admin' && role !== 'staff') {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'You are not authorized to create admin history'
    })
    return
  }

  const history = await adminHistoryService.createAdminHistory({
    admin_id,
    contract_id,
    dispute_id,
    user_id,
    action,
    note
  })

  if (!history) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Create admin history failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Create admin history successfully',
    data: history
  })
})

const getAllAdminHistories = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    admin_id: query.admin_id,
    contract_id: query.contract_id,
    dispute_id: query.dispute_id,
    user_id: query.user_id,
    action: query.action
  }

  const result = await adminHistoryService.getAllAdminHistories(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all admin histories successfully',
    ...result
  })
})

const getAdminHistoryById = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const history = await adminHistoryService.getAdminHistoryById(id as string)

  res.status(HttpStatus.OK).json({
    message: 'Get admin history successfully',
    data: history
  })
})

const getHistoriesByAdminId = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const adminId = req.user?._id
  const role = req.user?.role

  if (!adminId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Admin ID is required'
    })
    return
  }

  if (role !== 'admin' && role !== 'staff') {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'You are not authorized to get admin history'
    })
    return
  }

  const histories = await adminHistoryService.getHistoriesByAdminId(adminId as string)

  res.status(HttpStatus.OK).json({
    message: 'Get histories by admin successfully',
    data: histories
  })
})

const getHistoriesByContractId = expressAsyncHandler(async (req: Request, res: Response) => {
  const { contractId } = req.params

  if (!contractId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Contract ID is required'
    })
    return
  }

  const histories = await adminHistoryService.getHistoriesByContractId(contractId as string)

  res.status(HttpStatus.OK).json({
    message: 'Get histories by contract successfully',
    data: histories
  })
})

const getHistoriesByDisputeId = expressAsyncHandler(async (req: Request, res: Response) => {
  const { disputeId } = req.params

  if (!disputeId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Dispute ID is required'
    })
    return
  }

  const histories = await adminHistoryService.getHistoriesByDisputeId(disputeId as string)

  res.status(HttpStatus.OK).json({
    message: 'Get histories by dispute successfully',
    data: histories
  })
})

const getHistoriesByUserId = expressAsyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const histories = await adminHistoryService.getHistoriesByUserId(userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Get histories by user successfully',
    data: histories
  })
})

const updateAdminHistory = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Admin history ID is required'
    })
    return
  }

  const { action, note } = req.body
  const adminId = req.user?._id
  const role = req.user?.role

  if (!adminId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Admin ID is required'
    })
    return
  }

  if (role !== 'admin' && role !== 'staff') {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'You are not authorized to update admin history'
    })
    return
  }

  const history = await adminHistoryService.updateAdminHistory(id as string, adminId as string, {
    action,
    note
  })

  if (!history) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Update admin history failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Update admin history successfully',
    data: history
  })
})

const deleteAdminHistory = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Admin history ID is required'
    })
    return
  }

  const adminId = req.user?._id
  const role = req.user?.role

  if (!adminId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Admin ID is required'
    })
    return
  }

  if (role !== 'admin' && role !== 'staff') {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'You are not authorized to delete admin history'
    })
    return
  }

  const result = await adminHistoryService.deleteAdminHistory(id as string, adminId as string)

  if (!result) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Delete admin history failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: result.message
  })
})

export const adminHistoryController = {
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
