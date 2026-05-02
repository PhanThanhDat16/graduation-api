import { AIJobData, AIFreelancerData } from '@/constants/ai.constants'
import { Project } from '@/models/project.model'
import { User } from '@/models/user.model'
import mongoose from 'mongoose'

/**
 * Transform a raw project document into the AI-expected job format.
 * Returns raw fields without fabrication.
 */
const transformProjectToAIJob = (project: any): AIJobData => ({
  id: project._id.toString(),
  title: project.title || '',
  description: project.description || '',
  category: project.category || '',
  skills: project.skills || [],
  budgetMin: project.budgetMin || 0,
  budgetMax: project.budgetMax || 0,
  status: project.status || '',
  contractorId: project.contractorId?.toString() || '',
  createdAt: project.createdAt?.toISOString() || ''
})

/**
 * Transform a raw user document into the AI-expected freelancer format.
 * Returns raw fields without fabrication.
 */
const transformUserToAIFreelancer = (user: any): AIFreelancerData => ({
  id: user._id.toString(),
  fullName: user.fullName || '',
  description: user.description || '',
  role: user.role || '',
  ratingAvg: user.ratingAvg ?? null,
  ratingCount: user.ratingCount ?? null,
  status: user.status || ''
})

/**
 * Get all open projects formatted for the AI service.
 */
const getJobsForAI = async (): Promise<AIJobData[]> => {
  const projects = await Project.find({ status: 'open' })
    .select('_id title description category skills budgetMin budgetMax status contractorId createdAt')
    .lean()

  return projects.map(transformProjectToAIJob)
}

/**
 * Get a single project by ID formatted for the AI service.
 */
const getJobByIdForAI = async (projectId: string): Promise<AIJobData | null> => {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return null
  }

  const project = await Project.findById(projectId)
    .select('_id title description category skills budgetMin budgetMax status contractorId createdAt')
    .lean()

  if (!project) {
    return null
  }

  return transformProjectToAIJob(project)
}

/**
 * Get all active freelancers and contractors formatted for the AI service.
 */
const getFreelancersForAI = async (): Promise<AIFreelancerData[]> => {
  const users = await User.find({
    role: { $in: ['freelancer', 'contractor'] },
    status: 'active'
  })
    .select('_id fullName description role ratingAvg ratingCount status')
    .lean()

  return users.map(transformUserToAIFreelancer)
}

/**
 * Get a single freelancer/contractor by ID formatted for the AI service.
 */
const getFreelancerByIdForAI = async (userId: string): Promise<AIFreelancerData | null> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return null
  }

  const user = await User.findOne({
    _id: userId,
    role: { $in: ['freelancer', 'contractor'] },
    status: 'active'
  })
    .select('_id fullName description role ratingAvg ratingCount status')
    .lean()

  if (!user) {
    return null
  }

  return transformUserToAIFreelancer(user)
}

export const aiService = {
  getJobsForAI,
  getJobByIdForAI,
  getFreelancersForAI,
  getFreelancerByIdForAI
}
