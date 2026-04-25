import { Response, Request } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { RequestWithUser } from '@/middlewares/auth.middlewares'
import { chatService } from '@/services/chat/chat.service'
import { emitChatNewMessage } from '@/socket/chatEmit'

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

/**
 * Get paginated messages for a chat group
 */
const getMessages = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = extractUserId(req)
  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const groupId = req.params.groupId as string
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 20

  try {
    const result = await chatService.getMessagesPaginated(userId, groupId, page, limit)
    res.status(HttpStatus.OK).json({
      message: 'OK',
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    })
  } catch (err) {
    if (!handleServiceError(err, res)) {
      throw err
    }
  }
})

/**
 * Get members of a chat group
 */
const getMembers = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = extractUserId(req)
  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const groupId = req.params.groupId as string

  try {
    const data = await chatService.listMembers(userId, groupId)
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
 * Save message - Unified endpoint for both guests and authenticated users
 * For guests: Only requires content and guestName
 * For authenticated users: Only requires content and userId (in body)
 *
 * Request body: { content: string; userId?: string; guestName?: string; type?: string }
 */
type SaveMessageReq = Request<
  { groupId: string },
  object,
  { content: string; userId?: string; guestName?: string; type?: string }
>
const createMessage = expressAsyncHandler(async (req: SaveMessageReq, res: Response) => {
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

    const message = await chatService.saveMessage(groupId as string, content.trim(), {
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

export const chatController = {
  getMessages,
  getMembers,
  createMessage
}
