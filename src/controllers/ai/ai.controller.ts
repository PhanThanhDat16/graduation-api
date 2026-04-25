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

export const aiController = {
  getJobs,
  getJobById,
  getFreelancers,
  getFreelancerById
}
