import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { notificationService } from '@/services/notification/notification.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'
import { EStatusRoleUser } from '@/constants/user.constants'

const createNotification = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { userId, type, title, content } = req.body
  const role = req.user?.role

  if (role !== EStatusRoleUser.ADMIN && role !== EStatusRoleUser.STAFF) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
    return
  }

  if (!userId || !type || !title || !content) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'userId, type, title and content are required'
    })
    return
  }

  const notification = await notificationService.createNotification({
    userId,
    type,
    title,
    content
  })

  if (!notification) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Create notification failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Create notification successfully',
    data: notification
  })
})

const createManyNotifications = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { notifications } = req.body
  const role = req.user?.role

  if (role !== EStatusRoleUser.ADMIN && role !== EStatusRoleUser.STAFF) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
    return
  }

  if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'notifications array is required and must not be empty'
    })
    return
  }

  const result = await notificationService.createManyNotifications(notifications)

  res.status(HttpStatus.OK).json({
    message: 'Create notifications successfully',
    data: result
  })
})

const getAllNotifications = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const query = req.query
  const role = req.user?.role

  if (role !== EStatusRoleUser.ADMIN && role !== EStatusRoleUser.STAFF) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
    return
  }

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    userId: query.userId,
    type: query.type,
    isRead: query.isRead !== undefined ? query.isRead === 'true' : undefined
  }

  const result = await notificationService.getAllNotifications(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all notifications successfully',
    ...result
  })
})

const getNotificationById = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  const role = req.user?.role

  if (role !== EStatusRoleUser.ADMIN && role !== EStatusRoleUser.STAFF) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
    return
  }

  const notification = await notificationService.getNotificationById(id as string)

  res.status(HttpStatus.OK).json({
    message: 'Get notification successfully',
    data: notification
  })
})

const getMyNotifications = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const query = req.query
  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: query.sortBy || 'createdAt',
    sortOrder: query.sortOrder || 'desc',
    type: query.type,
    isRead: query.isRead !== undefined ? query.isRead === 'true' : undefined
  }

  const result = await notificationService.getNotificationsByUserId(userId as string, filter)

  res.status(HttpStatus.OK).json({
    message: 'Get my notifications successfully',
    ...result
  })
})

const getNotificationsByUserId = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.params.userId
  const role = req.user?.role

  if (role !== EStatusRoleUser.ADMIN && role !== EStatusRoleUser.STAFF) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
    return
  }

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const query = req.query
  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: query.sortBy || 'createdAt',
    sortOrder: query.sortOrder || 'desc',
    type: query.type,
    isRead: query.isRead !== undefined ? query.isRead === 'true' : undefined
  }

  const result = await notificationService.getNotificationsByUserId(userId as string, filter)

  res.status(HttpStatus.OK).json({
    message: 'Get notifications successfully',
    ...result
  })
})

const getUnreadCount = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const result = await notificationService.getUnreadCount(userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Get unread count successfully',
    data: result
  })
})

const markAsRead = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params
  const userId = req.user?._id

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Notification ID is required'
    })
    return
  }

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const notification = await notificationService.markAsRead(id as string, userId as string)

  if (!notification) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Mark as read failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Mark as read successfully',
    data: notification
  })
})

const markAllAsRead = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const result = await notificationService.markAllAsRead(userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Mark all as read successfully',
    data: result
  })
})

const deleteNotification = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params
  const userId = req.user?._id

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Notification ID is required'
    })
    return
  }

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const result = await notificationService.deleteNotification(id as string, userId as string)

  if (!result) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Delete notification failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: result.message
  })
})

const deleteAllMyNotifications = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const result = await notificationService.deleteAllByUserId(userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Delete all notifications successfully',
    data: result
  })
})

export const notificationController = {
  createNotification,
  createManyNotifications,
  getAllNotifications,
  getNotificationById,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllMyNotifications,
  getNotificationsByUserId
}
