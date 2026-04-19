import { chatController } from '@/controllers/chat/chat.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

router.post('/groups', requireAuth, chatController.createGroup)
router.get('/groups', requireAuth, chatController.listGroups)
router.get('/groups/:groupId/messages', requireAuth, chatController.getMessages)
router.get('/groups/:groupId/members', requireAuth, chatController.getMembers)

export const routerChat = router
