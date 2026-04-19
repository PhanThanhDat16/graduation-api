import { conversationController } from '@/controllers/conversation/conversation.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

// GUEST & USER MESSAGES
// Unified message endpoint for both guests and authenticated users
// For guests: provide guestName in body
// For users: authentication is detected from token
router.post('/:groupId/messages', conversationController.saveMessage)

// GUEST CONVERSATION SETUP
// Create a new guest conversation
router.post('/guest', conversationController.createGuestConversation)

// Merge guest conversation to user account (requires auth)
router.post('/merge', requireAuth, conversationController.mergeGuestConversation)

// Get conversation by member_id
router.get('/guest', conversationController.getConversationByGuest)

// Get conversation (chat_group) by ID
router.get('/:groupId', conversationController.getConversation)

export const routerConversation = router
