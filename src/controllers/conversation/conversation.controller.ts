import { Request as ExpressRequest, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { RequestWithUser } from '@/middlewares/auth.middlewares'
import { conversationService } from '@/services/conversation/conversation.service'
import { emitChatNewMessage } from '@/socket/chatEmit'

type CreateGuestConversationReq = ExpressRequest<unknown, object, { guestName: string }>
const createGuestConversation = expressAsyncHandler(async (req: CreateGuestConversationReq, res: Response) => {
  const { guestName } = req.body

  if (!guestName) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'guestName is required' })
    return
  }

  if (!guestName || typeof guestName !== 'string' || guestName.trim().length === 0) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'guestName is required and must be non-empty string' })
    return
  }

  const conversation = await conversationService.createGuestConversation(guestName.trim())

  res.status(HttpStatus.OK).json({
    message: 'Guest conversation created',
    data: conversation
  })
})

type GetConversationReq = ExpressRequest<{ groupId: string }>
const getConversation = expressAsyncHandler(async (req: GetConversationReq, res: Response) => {
  const { groupId } = req.params

  if (!groupId) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'groupId is required' })
    return
  }

  const conversation = await conversationService.getConversationById(groupId)

  if (!conversation) {
    res.status(HttpStatus.NOT_FOUND).json({ message: 'Conversation not found' })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'OK',
    data: conversation
  })
})

type GetConversationByGuestReq = ExpressRequest<unknown, object, unknown, { userId?: string; groupId?: string }>
const getConversationByGuest = expressAsyncHandler(async (req: GetConversationByGuestReq, res: Response) => {
  const { userId, groupId } = req.query

  if (!userId && !groupId) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'userId or groupId is required' })
    return
  }

  let conversation
  if (groupId) {
    conversation = await conversationService.getConversationById(groupId as string)
  } else if (userId) {
    conversation = await conversationService.getConversationByUserId(userId as string, groupId as string)
  }

  if (!conversation) {
    res.status(HttpStatus.NOT_FOUND).json({ message: 'Conversation not found' })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'OK',
    data: conversation
  })
})

/**
 * Merge guest conversation to user account
 * Called when a guest logs in to transfer their conversation to their account
 * Requires authentication
 */
const mergeGuestConversation = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?._id ? String(req.user._id) : null

    if (!userId) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
      return
    }

    const { guestUserId } = req.body

    if (!guestUserId) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'guestUserId is required' })
      return
    }

    const conversation = await conversationService.mergeGuestConversation(guestUserId, userId)

    res.status(HttpStatus.OK).json({
      message: 'Conversation merged successfully',
      data: conversation
    })
  } catch (error) {
    console.error('[ConversationController] Error merging conversation:', error)
    res.status(HttpStatus.BAD_REQUEST).json({
      message: error instanceof Error ? error.message : 'Failed to merge conversation'
    })
  }
})

/**
 * Save message - Unified endpoint for both guests and authenticated users
 * For guests: Only requires content and guestName
 * For authenticated users: Only requires content and userId (in body)
 *
 * Request body: { content: string; userId?: string; guestName?: string; type?: string }
 */
type SaveMessageReq = ExpressRequest<
  { groupId: string },
  object,
  { content: string; userId?: string; guestName?: string; type?: string }
>
const saveMessage = expressAsyncHandler(async (req: SaveMessageReq, res: Response) => {
  const { groupId } = req.params
  const { content, userId, guestName, type } = req.body

  if (!groupId) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'groupId is required' })
    return
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'content is required and must be non-empty string' })
    return
  }

  try {
    // Determine if it's a guest or authenticated user message
    if (!userId && !guestName) {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Either userId (for users) or guestName (for guests) is required'
      })
      return
    }

    const message = await conversationService.saveMessage(groupId as string, content.trim(), {
      userId: userId,
      guestName: guestName?.trim(),
      type: type || 'text'
    })

    // Emit message to all users in the chat group via Socket.IO
    emitChatNewMessage(groupId, message)

    res.status(HttpStatus.OK).json({
      message: 'Message saved successfully',
      data: message
    })
  } catch (error) {
    console.error('[ConversationController] Error saving message:', error)
    res.status(HttpStatus.BAD_REQUEST).json({
      message: error instanceof Error ? error.message : 'Failed to save message'
    })
  }
})

export const conversationController = {
  createGuestConversation,
  getConversation,
  getConversationByGuest,
  mergeGuestConversation,
  saveMessage
}
