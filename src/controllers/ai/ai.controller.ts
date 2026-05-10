import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'
import { HttpStatus } from '@/constants/http.constants'
import { aiService } from '@/services/ai/ai.service'

const getJobs = expressAsyncHandler(async (req: Request, res: Response) => {
  const jobs = await aiService.getJobsForAI()

  res.status(HttpStatus.OK).json({
    jobs
  })
})

const getJobById = expressAsyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  const job = await aiService.getJobByIdForAI(id)

  if (!job) {
    res.status(HttpStatus.NOT_FOUND).json({
      message: 'Job not found'
    })
    return
  }

  res.status(HttpStatus.OK).json(job)
})

const getFreelancers = expressAsyncHandler(async (req: Request, res: Response) => {
  const freelancers = await aiService.getFreelancersForAI()

  res.status(HttpStatus.OK).json({
    freelancers
  })
})

const getFreelancerById = expressAsyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  const freelancer = await aiService.getFreelancerByIdForAI(id)

  if (!freelancer) {
    res.status(HttpStatus.NOT_FOUND).json({
      message: 'Freelancer not found'
    })
    return
  }

  res.status(HttpStatus.OK).json(freelancer)
})

const getContractors = expressAsyncHandler(async (req: Request, res: Response) => {
  const contractors = await aiService.getContractorsForAI()

  res.status(HttpStatus.OK).json({
    contractors
  })
})

const getContractorById = expressAsyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string

  const contractor = await aiService.getContractorByIdForAI(id)

  if (!contractor) {
    res.status(HttpStatus.NOT_FOUND).json({
      message: 'Contractor not found'
    })
    return
  }

  res.status(HttpStatus.OK).json(contractor)
})

/**
 * Get last N messages of a group for AI context (no auth).
 * GET /internal/ai/groups/:groupId/messages?limit=10
 */
const getMessages = expressAsyncHandler(async (req: Request, res: Response) => {
  const groupId = req.params.groupId as string
  const limit = Number(req.query.limit) || 10

  const result = await aiService.getMessagesForAI(groupId, limit)

  if (!result) {
    res.status(HttpStatus.NOT_FOUND).json({
      message: 'Group not found'
    })
    return
  }

  res.status(HttpStatus.OK).json(result)
})

/**
 * Save an AI-generated message into a group.
 * POST /internal/ai/groups/:groupId/messages
 * Body: { content: string }
 */
const createMessage = expressAsyncHandler(async (req: Request, res: Response) => {
  const groupId = req.params.groupId as string
  const { content } = req.body

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'content is required and must be non-empty string'
    })
    return
  }

  try {
    const message = await aiService.createMessageForAI(groupId, content.trim())
    res.status(HttpStatus.OK).json({
      message: 'AI message saved successfully',
      data: message
    })
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: error instanceof Error ? error.message : 'Failed to save AI message'
    })
  }
})

export const aiController = {
  getJobs,
  getJobById,
  getFreelancers,
  getFreelancerById,
  getContractors,
  getContractorById,
  getMessages,
  createMessage
}
