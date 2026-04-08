import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { applicationService } from '@/services/application/application.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'

const createApplication = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { projectId, proposal, proposedBudget } = req.body
  const freelancerId = req.user?.id

  if (!projectId || !proposal || proposedBudget === undefined || !freelancerId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Project ID, proposal and proposed budget are required'
    })
    return
  }

  const application = await applicationService.createApplication({
    projectId,
    freelancerId,
    proposal,
    proposedBudget
  })

  if (!application) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Create application failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Create application successfully',
    data: application
  })
})

const getAllApplication = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    projectId: query.projectId,
    freelancerId: query.freelancerId,
    status: query.status
  }

  const result = await applicationService.getAllApplication(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all applications successfully',
    ...result
  })
})

const getApplicationById = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const application = await applicationService.getApplicationById(id as string)

  res.status(HttpStatus.OK).json({
    message: 'Get application successfully',
    data: application
  })
})

const getApplicationsByProjectId = expressAsyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params

  if (!projectId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Project ID is required'
    })
    return
  }

  const applications = await applicationService.getApplicationsByProjectId(projectId as string)

  res.status(HttpStatus.OK).json({
    message: 'Get applications by project successfully',
    data: applications
  })
})

const getMyApplications = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const freelancerId = req.user?.id

  if (!freelancerId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Freelancer ID is required'
    })
    return
  }

  const applications = await applicationService.getApplicationsByFreelancerId(freelancerId as string)

  res.status(HttpStatus.OK).json({
    message: 'Get my applications successfully',
    data: applications
  })
})

const updateApplication = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Application ID is required'
    })
    return
  }

  const { proposal, proposedBudget } = req.body
  const freelancerId = req.user?.id

  if (!freelancerId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Freelancer ID is required'
    })
    return
  }

  const application = await applicationService.updateApplication(id as string, freelancerId as string, {
    proposal,
    proposedBudget
  })

  if (!application) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Update application failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Update application successfully',
    data: application
  })
})

const updateApplicationStatus = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params
  const { status } = req.body
  const contractorId = req.user?.id

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Application ID is required'
    })
    return
  }

  if (!status || !['accepted', 'rejected'].includes(status)) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Status must be accepted or rejected'
    })
    return
  }

  if (!contractorId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Contractor ID is required'
    })
    return
  }

  const application = await applicationService.updateApplicationStatus(id as string, contractorId as string, status)

  if (!application) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Update application status failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Update application status successfully',
    data: application
  })
})

const deleteApplication = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Application ID is required'
    })
    return
  }

  const freelancerId = req.user?.id

  if (!freelancerId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Freelancer ID is required'
    })
    return
  }

  const result = await applicationService.deleteApplication(id as string, freelancerId as string)

  if (!result) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Delete application failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: result.message
  })
})

export const applicationController = {
  createApplication,
  getAllApplication,
  getApplicationById,
  getApplicationsByProjectId,
  getMyApplications,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
}
