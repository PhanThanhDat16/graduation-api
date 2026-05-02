import { ENotificationType } from '@/constants/notification.constants'
import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema<INotification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ENotificationType,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    versionKey: false,
    strict: true
  }
)

notificationSchema.index({ userId: 1, isRead: 1 })

export const Notification = mongoose.model<INotification>('Notification', notificationSchema)

export interface INotification {
  userId: mongoose.Schema.Types.ObjectId
  type: ENotificationType
  title: string
  content: string
  isRead: boolean
}
