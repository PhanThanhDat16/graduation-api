import { chatController } from '@/controllers/chat/chat.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

router.post('/:groupId/messages', chatController.createMessage)

router.get('/groups/:groupId/messages', requireAuth, chatController.getMessages)
router.get('/groups/:groupId/members', requireAuth, chatController.getMembers)

export const routerChat = router
