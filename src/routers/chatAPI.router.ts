import { chatController } from '@/controllers/chat/chat.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

router.post('/groups/:groupId/messages', chatController.createMessage)
router.get('/groups/:groupId/messages/guest', chatController.getGuestMessages)

router.get('/groups/:groupId/messages', requireAuth, chatController.getMessages)
router.get('/groups/:groupId/members', requireAuth, chatController.getMembers)

export const routerChat = router
