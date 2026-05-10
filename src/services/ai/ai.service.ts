import { AIJobData, AIFreelancerData } from '@/constants/ai.constants'
import { Project } from '@/models/project.model'
import { User } from '@/models/user.model'
import { ChatGroup } from '@/models/chat_group.model'
import { Message } from '@/models/message.model'
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
 * Transform a raw user document into the AI-expected freelancer/contractor format.
 * Returns raw fields without fabrication.
 */
const transformUserToAIFreelancer = (user: any): AIFreelancerData => ({
  id: user._id.toString(),
  fullName: user.fullName || '',
  description: user.description || '',
  role: user.role || '',
  ratingAvg: user.ratingAvg ?? 0,
  ratingCount: user.ratingCount ?? 0,
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
 * Get all active freelancers (role=freelancer) formatted for the AI service.
 */
const getFreelancersForAI = async (): Promise<AIFreelancerData[]> => {
  const users = await User.find({
    role: 'freelancer',
    status: 'active'
  })
    .select('_id fullName description role ratingAvg ratingCount status')
    .lean()

  return users.map(transformUserToAIFreelancer)
}

/**
 * Get a single freelancer by ID formatted for the AI service.
 */
const getFreelancerByIdForAI = async (userId: string): Promise<AIFreelancerData | null> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return null
  }

  const user = await User.findOne({
    _id: userId,
    role: 'freelancer',
    status: 'active'
  })
    .select('_id fullName description role ratingAvg ratingCount status')
    .lean()

  if (!user) {
    return null
  }

  return transformUserToAIFreelancer(user)
}

/**
 * Get all active contractors (role=contractor) formatted for the AI service.
 */
const getContractorsForAI = async (): Promise<AIFreelancerData[]> => {
  const users = await User.find({
    role: 'contractor',
    status: 'active'
  })
    .select('_id fullName description role ratingAvg ratingCount status')
    .lean()

  return users.map(transformUserToAIFreelancer)
}

/**
 * Get a single contractor by ID formatted for the AI service.
 */
const getContractorByIdForAI = async (userId: string): Promise<AIFreelancerData | null> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return null
  }

  const user = await User.findOne({
    _id: userId,
    role: 'contractor',
    status: 'active'
  })
    .select('_id fullName description role ratingAvg ratingCount status')
    .lean()

  if (!user) {
    return null
  }

  return transformUserToAIFreelancer(user)
}

/**
 * Get the last N messages of a group, simplified for AI context.
 * No auth check — internal AI service only.
 */
const getMessagesForAI = async (groupId: string, limit: number = 10) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return null
  }

  const group = await ChatGroup.findById(groupId).lean()
  if (!group) {
    return null
  }

  const raw = await Message.find({ groupId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('senderId', 'fullName')
    .lean()

  // Return newest-first reversed to chronological order
  const messages = raw.reverse().map((m: any) => ({
    role: m.senderType === 'ai' ? 'assistant' : 'user',
    content: m.content,
    senderName: m.senderId?.fullName || m.senderName || 'Unknown',
    createdAt: m.createdAt
  }))

  return { groupId, messages }
}

/**
 * Save an AI-generated message into the group.
 * Uses senderType='ai' with no senderId.
 */
const createMessageForAI = async (groupId: string, content: string) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new Error('Invalid group ID')
  }

  const group = await ChatGroup.findById(groupId)
  if (!group) {
    throw new Error('Group not found')
  }

  const message = await Message.create({
    groupId,
    senderId: null,
    senderType: 'ai',
    senderName: 'AI Assistant',
    type: 'text',
    content
  } as any)

  // Update chat_group last message
  await ChatGroup.findByIdAndUpdate(groupId, {
    lastMessage: content,
    lastMessageAt: new Date(),
    lastSenderId: null
  })

  return {
    _id: message._id.toString(),
    groupId: groupId,
    content: message.content,
    senderType: 'ai',
    createdAt: message.createdAt
  }
}

export const aiService = {
  getJobsForAI,
  getJobByIdForAI,
  getFreelancersForAI,
  getFreelancerByIdForAI,
  getContractorsForAI,
  getContractorByIdForAI,
  getMessagesForAI,
  createMessageForAI
}
