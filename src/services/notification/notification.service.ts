import { ICreateNotification, NotificationQuery } from '@/constants/notification.constants'
import { Notification } from '@/models/notification.model'
import { paginate } from '@/utils/paginate'
import mongoose from 'mongoose'

const NOTIFICATION_SAFE_FIELDS = '_id user_id type title content is_read created_at updated_at'

const createNotification = async (data: ICreateNotification) => {
  if (!mongoose.Types.ObjectId.isValid(data.user_id)) {
    throw new Error('Invalid user ID format')
  }

  const notification = await Notification.create(data as any)

  return notification
}

const createManyNotifications = async (dataList: ICreateNotification[]) => {
  for (const data of dataList) {
    if (!mongoose.Types.ObjectId.isValid(data.user_id)) {
      throw new Error(`Invalid user ID format: ${data.user_id}`)
    }
  }

  const notifications = await Notification.insertMany(dataList as any[])

  return notifications
}

const getAllNotifications = async (query: NotificationQuery) => {
  const filter: any = {}

  if (query.user_id) {
    filter.user_id = new mongoose.Types.ObjectId(query.user_id)
  }

  if (query.type) {
    filter.type = query.type
  }

  if (query.is_read !== undefined) {
    filter.is_read = query.is_read
  }

  return await paginate(Notification, filter, query, NOTIFICATION_SAFE_FIELDS)
}

const getNotificationById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid notification ID format')
  }

  const notification = await Notification.findById(id)
    .select(NOTIFICATION_SAFE_FIELDS)
    .populate('user_id', '_id name email avatar')
    .lean()

  if (!notification) {
    throw new Error('Notification not found')
  }

  return notification
}

const getNotificationsByUserId = async (userId: string, query: NotificationQuery) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const filter: any = { user_id: new mongoose.Types.ObjectId(userId) }

  if (query.type) {
    filter.type = query.type
  }

  if (query.is_read !== undefined) {
    filter.is_read = query.is_read
  }

  return await paginate(Notification, filter, query, NOTIFICATION_SAFE_FIELDS)
}

const getUnreadCount = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const count = await Notification.countDocuments({
    user_id: new mongoose.Types.ObjectId(userId),
    is_read: false
  } as any)

  return { unreadCount: count }
}

const markAsRead = async (id: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid notification ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const notification = await Notification.findById(id)

  if (!notification) {
    throw new Error('Notification not found')
  }

  if (notification.user_id?.toString() !== userId) {
    throw new Error('You are not authorized to update this notification')
  }

  const updated = await Notification.findByIdAndUpdate(id, { is_read: true }, { new: true })
    .select(NOTIFICATION_SAFE_FIELDS)
    .lean()

  return updated
}

const markAllAsRead = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const result = await Notification.updateMany(
    { user_id: new mongoose.Types.ObjectId(userId), is_read: false } as any,
    { is_read: true }
  )

  return { modifiedCount: result.modifiedCount }
}

const deleteNotification = async (id: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid notification ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const notification = await Notification.findById(id)

  if (!notification) {
    throw new Error('Notification not found')
  }

  if (notification.user_id?.toString() !== userId) {
    throw new Error('You are not authorized to delete this notification')
  }

  await Notification.findByIdAndDelete(id)

  return { message: 'Notification deleted successfully' }
}

const deleteAllByUserId = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const result = await Notification.deleteMany({
    user_id: new mongoose.Types.ObjectId(userId)
  } as any)

  return { deletedCount: result.deletedCount }
}

export const notificationService = {
  createNotification,
  createManyNotifications,
  getAllNotifications,
  getNotificationById,
  getNotificationsByUserId,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllByUserId
}
