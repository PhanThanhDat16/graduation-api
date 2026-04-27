import { Request as ExpressRequest, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { RequestWithUser } from '@/middlewares/auth.middlewares'
import { conversationService } from '@/services/conversation/conversation.service'
import { emitChatNewMessage } from '@/socket/chatEmit'
import { CreateChatGroupBody } from '@/constants/chat.constants'

const extractUserId = (req: RequestWithUser): string | null => {
  return req.user?._id ? String(req.user._id) : null
}

const handleServiceError = (error: unknown, res: Response): boolean => {
  if (error instanceof Error) {
    const status = HttpStatus.BAD_REQUEST
    res.status(status).json({ message: error.message })
    return true
  }
  return false
}

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

const createGroup = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = extractUserId(req)
  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  try {
    const body = req.body as CreateChatGroupBody
    const data = await conversationService.createGroup(userId, {
      type: body.type,
      disputeId: body.disputeId,
      memberIds: Array.isArray(body.memberIds) ? body.memberIds : []
    })
    res.status(HttpStatus.OK).json({
      message: 'Chat group created',
      data
    })
  } catch (err) {
    if (!handleServiceError(err, res)) {
      throw err
    }
  }
})

/**
 * List all chat groups for current user
 */
const listGroups = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = extractUserId(req)
  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  try {
    const data = await conversationService.listGroupsForUser(userId)
    res.status(HttpStatus.OK).json({
      message: 'OK',
      data
    })
  } catch (err) {
    if (!handleServiceError(err, res)) {
      throw err
    }
  }
})

/**
 * Reassign all conversations from one staff to another (admin only)
 */
const reassignConversations = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = extractUserId(req)
  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  // Check admin role
  const userRole = req.user?.role
  if (userRole !== 'admin') {
    res.status(HttpStatus.FORBIDDEN).json({ message: 'Only admin can reassign conversations' })
    return
  }

  const { fromStaffId, toStaffId } = req.body

  if (!fromStaffId || !toStaffId) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'fromStaffId and toStaffId are required' })
    return
  }

  try {
    const result = await conversationService.reassignStaffConversations(fromStaffId, toStaffId)
    res.status(HttpStatus.OK).json({
      message: 'Conversations reassigned successfully',
      data: result
    })
  } catch (err) {
    if (!handleServiceError(err, res)) {
      throw err
    }
  }
})

/**
 * List all conversations for staff/admin with optional type filter
 */
const listAllConversations = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = extractUserId(req)
  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const userRole = req.user?.role
  if (userRole !== 'staff' && userRole !== 'admin') {
    res.status(HttpStatus.FORBIDDEN).json({ message: 'Only staff and admin can access this endpoint' })
    return
  }

  try {
    const type = req.query.type as string | undefined
    const data = await conversationService.listAllConversations(type)
    res.status(HttpStatus.OK).json({
      message: 'OK',
      data
    })
  } catch (err) {
    if (!handleServiceError(err, res)) {
      throw err
    }
  }
})

export const conversationController = {
  createGuestConversation,
  getConversation,
  getConversationByGuest,
  mergeGuestConversation,
  createGroup,
  listGroups,
  reassignConversations,
  listAllConversations
}
