import { notificationController } from '@/controllers/notification/notification.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

// User routes (authenticated)
router.get('/me', requireAuth, notificationController.getMyNotifications)
router.get('/me/unread-count', requireAuth, notificationController.getUnreadCount)
router.put('/me/read-all', requireAuth, notificationController.markAllAsRead)
router.delete('/me/all', requireAuth, notificationController.deleteAllMyNotifications)
router.put('/:id/read', requireAuth, notificationController.markAsRead)
router.delete('/:id', requireAuth, notificationController.deleteNotification)

// Admin routes
router.get('/', requireAuth, notificationController.getAllNotifications)
router.get('/:id', requireAuth, notificationController.getNotificationById)
router.get('/user/:user_id', requireAuth, notificationController.getNotificationsByUserId)
router.post('/', requireAuth, notificationController.createNotification)
router.post('/bulk', requireAuth, notificationController.createManyNotifications)

export const routerNotification = router
