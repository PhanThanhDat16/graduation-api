import { conversationController } from '@/controllers/conversation/conversation.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

router.post('/groups', requireAuth, conversationController.createGroup)
router.get('/groups', requireAuth, conversationController.listGroups)

// Create a new guest conversation
router.post('/guest', conversationController.createGuestConversation)

// Merge guest conversation to user account (requires auth)
router.post('/merge', requireAuth, conversationController.mergeGuestConversation)

// Get conversation by member_id
router.get('/guest', conversationController.getConversationByGuest)

// Admin: reassign all conversations from one staff to another
router.post('/reassign', requireAuth, conversationController.reassignConversations)

// Staff/Admin: list all conversations with optional type filter
router.get('/all', requireAuth, conversationController.listAllConversations)

// Get conversation (chat_group) by ID
router.get('/:groupId', conversationController.getConversation)

export const routerConversation = router
