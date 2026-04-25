import { AIJobData, AIFreelancerData } from '@/constants/ai.constants'
import { Project } from '@/models/project.model'
import { User } from '@/models/user.model'
import { Application } from '@/models/application.model'
import { Contract } from '@/models/contract.model'
import mongoose from 'mongoose'

/**
 * Transform a raw project document into the AI-expected job format.
 */
const transformProjectToAIJob = (project: any): AIJobData => {
  return {
    id: project._id.toString(),
    title: project.title || '',
    description: project.description || '',
    skills_required: project.skills || [],
    budget: Math.round(((project.budgetMin || 0) + (project.budgetMax || 0)) / 2),
    category: project.category || '',
    experience_level: 'Any',
    duration: 'Flexible'
  }
}

/**
 * Transform a raw user document into the AI-expected freelancer format.
 * Enriches with application history and completed contract count.
 */
const transformUserToAIFreelancer = async (user: any): Promise<AIFreelancerData> => {
  const userId = user._id.toString()

  // Get application history → list of projectIds the user applied to
  const applications = await Application.find({ freelancerId: user._id }).select('projectId').lean()
  const applyHistory = applications.map((app: any) => app.projectId.toString())

  // Count completed contracts
  const completedContracts = await Contract.countDocuments({
    freelancer_id: user._id,
    status: 'completed'
  })

  return {
    id: userId,
    name: user.fullName || '',
    title: user.description || user.role || '',
    bio: user.description || '',
    skills: [],
    rating: user.ratingAvg || 0,
    hourly_rate: 0,
    projects_completed: completedContracts,
    apply_history: applyHistory,
    certifications: []
  }
}

/**
 * Get all open projects formatted for the AI service.
 */
const getJobsForAI = async (): Promise<AIJobData[]> => {
  const projects = await Project.find({ status: 'open' })
    .select('_id title description category skills budgetMin budgetMax status')
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
    .select('_id title description category skills budgetMin budgetMax status')
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
    .select('_id fullName description role ratingAvg ratingCount')
    .lean()

  const results = await Promise.all(users.map(transformUserToAIFreelancer))
  return results
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
    .select('_id fullName description role ratingAvg ratingCount')
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
