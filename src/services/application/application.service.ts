import { IApplicationCreate, IApplicationUpdate, ApplicationQuery } from '@/constants/application.constant'
import { Application } from '@/models/application.model'
import { Project } from '@/models/project.model'
import { paginate } from '@/utils/paginate'
import mongoose from 'mongoose'

const APPLICATION_SAFE_FIELDS = '_id projectId freelancerId proposal proposedBudget status appliedAt'

const createApplication = async (data: IApplicationCreate) => {
  const project = await Project.findById(data.projectId)
  if (!project) {
    throw new Error('Project not found')
  }

  if (project.status !== 'open') {
    throw new Error('Project is not accepting applications')
  }

  // Check if user already applied
  const existingApplication = await Application.findOne({
    projectId: data.projectId,
    freelancerId: data.freelancerId
  })

  if (existingApplication) {
    throw new Error('You have already applied to this project')
  }

  const application = await Application.create(data as any)

  return application;
}

const getAllApplication = async (query: ApplicationQuery) => {
  const filter: any = {}
  filter.projectId = query.projectId
  filter.freelancerId = query.freelancerId

  if (query.status) {
    filter.status = query.status
  }

  return await paginate(Application, filter, query, APPLICATION_SAFE_FIELDS)
}

const getApplicationById = async (id: string) => {
  const application = await Application.findById(id)
    .select(APPLICATION_SAFE_FIELDS)
    .populate('projectId', 'title description category budgetMin budgetMax status')
    .populate('freelancerId', 'name email')
    .lean()

  if (!application) {
    throw new Error('Application not found')
  }

  return application
}

const getApplicationsByProjectId = async (projectId: string) => {
  const applications = await Application.find({ projectId })
    .select(APPLICATION_SAFE_FIELDS)
    .populate('freelancerId', 'name email')

  return applications || []
}

const getApplicationsByFreelancerId = async (freelancerId: string) => {
  const applications = await Application.find({ freelancerId })
    .select(APPLICATION_SAFE_FIELDS)
    .populate('projectId', 'title description category budgetMin budgetMax status')

  return applications || []
}

const updateApplication = async (id: string, freelancerId: string, data: IApplicationUpdate) => {
  const findApplication = await Application.findById(id)

  if (!findApplication) {
    throw new Error('Application not found')
  }

  if (findApplication.freelancerId?.toString() !== freelancerId) {
    throw new Error('You are not authorized to update this application')
  }

  if (findApplication.status !== 'pending') {
    throw new Error('Cannot update application that has been processed')
  }

  // Only allow updating proposal and proposedBudget
  const updateData: any = {}
  if (data.proposal) updateData.proposal = data.proposal
  if (data.proposedBudget) updateData.proposedBudget = data.proposedBudget

  const application = await Application.findByIdAndUpdate(id, updateData, { new: true })

  if (!application) {
    throw new Error('Application not found')
  }

  return application
}

const updateApplicationStatus = async (id: string, contractorId: string, status: 'accepted' | 'rejected') => {
  const findApplication = await Application.findById(id).populate('projectId')

  if (!findApplication) {
    throw new Error('Application not found')
  }

  const project = findApplication.projectId as any

  if (project.contractorId?.toString() !== contractorId) {
    throw new Error('You are not authorized to update this application status')
  }

  const application = await Application.findByIdAndUpdate(id, { status }, { new: true })

  if (!application) {
    throw new Error('Application not found')
  }

  return application
}

const deleteApplication = async (id: string, freelancerId: string) => {
  const findApplication = await Application.findById(id)

  if (!findApplication) {
    throw new Error('Application not found')
  }

  if (findApplication.freelancerId?.toString() !== freelancerId) {
    throw new Error('You are not authorized to delete this application')
  }

  if (findApplication.status !== 'pending') {
    throw new Error('Cannot delete application that has been processed')
  }

  const application = await Application.findByIdAndDelete(id)

  if (!application) {
    throw new Error('Application not found')
  }

  return { message: 'Application deleted successfully' }
}

export const applicationService = {
  createApplication,
  getAllApplication,
  getApplicationById,
  getApplicationsByProjectId,
  getApplicationsByFreelancerId,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
}
