import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { projectService } from '@/services/project/project.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'

const createProject = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { title, description, category, skills, budgetMin, budgetMax, status } = req.body
  const contractorId = req.user?.id

  if (!title || !description || !category || !contractorId || budgetMin === undefined || budgetMax === undefined) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Title, description, category, budgetMin and budgetMax are required'
    })
    return
  }

  const project = await projectService.createProject({
    title,
    description,
    category,
    skills,
    budgetMin,
    budgetMax,
    status,
    contractorId
  })

  if (!project) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Create project failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Create project successfully',
    data: project
  })
})

const getAllProject = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    contractorId: query.contractorId,
    category: query.category,
    status: query.status,
    keyword: query.keyword,
    likes: query.likes !== undefined ? Number(query.likes) : undefined,
    budgetMin: query.budgetMin !== undefined ? Number(query.budgetMin) : undefined,
    budgetMax: query.budgetMax !== undefined ? Number(query.budgetMax) : undefined
  }

  const result = await projectService.getAllProject(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all projects successfully',
    ...result
  })
})

const getProjectById = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const project = await projectService.getProjectById(id as string)

  res.status(HttpStatus.OK).json({
    message: 'Get project successfully',
    data: project
  })
})

const getProjectByContractorId = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const contractorId = req.user?.id

  if (!contractorId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Contractor ID is required'
    })
    return
  }

  const projects = await projectService.getProjectByContractorId(contractorId as string)

  if (!projects) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Get projects by contractor failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Get projects by contractor successfully',
    data: projects
  })
})

const updateProject = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Project ID is required'
    })
    return
  }

  const { title, description, category, skills, budgetMin, budgetMax, status } = req.body
  const contractorId = req.user?.id

  if (!contractorId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Contractor ID is required'
    })
    return
  }

  const project = await projectService.updateProject(id as string, contractorId as string, {
    title,
    description,
    category,
    skills,
    budgetMin,
    budgetMax,
    status
  })

  if (!project) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Update project failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Update project successfully',
    data: project
  })
})

const deleteProject = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Project ID is required'
    })
    return
  }

  const contractorId = req.user?.id

  if (!contractorId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Contractor ID is required'
    })
    return
  }

  const result = await projectService.deleteProject(id as string, contractorId as string)

  if (!result) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Delete project failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: result.message
  })
})

const likeProject = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Project ID is required'
    })
    return
  }

  const userId = req.user?.id

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const result = await projectService.likeProject(id as string, userId as string)

  if (!result) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Like/Dislike project failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Like/Dislike project successfully',
    data: result
  })
})

export const projectController = {
  createProject,
  getAllProject,
  getProjectById,
  getProjectByContractorId,
  updateProject,
  deleteProject,
  likeProject
}
