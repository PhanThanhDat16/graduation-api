import { Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { RequestWithUser } from '@/middlewares/auth.middlewares'
import { chatService } from '@/services/chat/chat.service'
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

const createGroup = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = extractUserId(req)
  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  try {
    const body = req.body as CreateChatGroupBody
    const data = await chatService.createGroup(userId, {
      type: body.type,
      memberId: body.memberId,
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
    const data = await chatService.listGroupsForUser(userId)
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

export const chatController = {
  createGroup,
  listGroups,
  getMessages,
  getMembers
}
