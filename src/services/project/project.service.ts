import { IProjectCreate, IProjectUpdate, ProjectQuery } from '@/constants/project.constant'
import { Project } from '@/models/project.model'
import { paginate } from '@/utils/paginate'

const PROJECT_SAFE_FIELDS =
  '_id contractorId title description category skills images budgetMin budgetMax status likes listLike createdAt updatedAt'

const CONTRACTOR_SAFE_FIELDS = '_id fullName email avatar ratingAvg address phone status ratingCount isVerified'

const createProject = async (data: IProjectCreate) => {
  const project = await Project.create(data as any)

  return project
}

const getAllProject = async (query: ProjectQuery) => {
  const filter: any = {}

  if (query.contractorId) {
    filter.contractorId = query.contractorId
  }

  if (query.status) {
    filter.status = query.status
  }

  if (query.category) {
    filter.category = query.category
  }

  if (query.likes !== undefined) {
    filter.likes = { $gte: Number(query.likes) }
  }

  if (query.budgetMin !== undefined) {
    filter.budgetMin = { $gte: Number(query.budgetMin) }
  }

  if (query.budgetMax !== undefined) {
    filter.budgetMax = { $lte: Number(query.budgetMax) }
  }
  
  if (query.skills) {
    const skillsArray = Array.isArray(query.skills) ? query.skills : (query.skills as string).split(',').map((s) => s.trim())
    filter.skills = { $in: skillsArray }
  }

  if (query.keyword) {
    filter.$or = [
      { title: { $regex: query.keyword, $options: 'i' } },
      { description: { $regex: query.keyword, $options: 'i' } }
    ]
  }


  return await paginate(Project, filter, query, PROJECT_SAFE_FIELDS, { path: 'contractorId', select: CONTRACTOR_SAFE_FIELDS })
}

const getProjectById = async (id: string) => {
  const project = await Project.findById(id)
    .select(PROJECT_SAFE_FIELDS)
    .populate({ path: 'contractorId', select: CONTRACTOR_SAFE_FIELDS })
    .lean()

  if (!project) {
    throw new Error('Project not found')
  }

  return project
}

const getProjectByContractorId = async (contractorId: string) => {
  const projects = await Project.find({ contractorId }).select(PROJECT_SAFE_FIELDS).populate('contractorId', 'fullName email avatar')

  return projects || []
}

const updateProject = async (id: string, contractorId: string, data: IProjectUpdate) => {
  const findProject = await Project.findById(id)

  if (!findProject) {
    throw new Error('Project not found')
  }

  if (findProject.contractorId?.toString() !== contractorId) {
    throw new Error('You are not authorized to update this project')
  }

  const project = await Project.findByIdAndUpdate(id, data, { new: true })

  if (!project) {
    throw new Error('Project not found')
  }

  return project
}

const deleteProject = async (id: string, contractorId: string) => {
  const findProject = await Project.findById(id)

  if (!findProject) {
    throw new Error('Project not found')
  }

  if (findProject.contractorId?.toString() !== contractorId) {
    throw new Error('You are not authorized to delete this project')
  }

  const project = await Project.findByIdAndDelete(id)

  if (!project) {
    throw new Error('Project not found')
  }

  return { message: 'Project deleted successfully' }
}

const likeProject = async (id: string, userId: string) => {
  const project = await Project.findById(id)

  if (!project) {
    throw new Error('Project not found')
  }

  const isLiked = project.listLike?.some((likeId) => likeId.toString() === userId)

  if (isLiked) {
    return await Project.findByIdAndUpdate(
      id,
      {
        $pull: { listLike: userId },
        $inc: { likes: -1 }
      },
      { new: true }
    ).lean()
  } else {
    return await Project.findByIdAndUpdate(
      id,
      {
        $addToSet: { listLike: userId },
        $inc: { likes: 1 }
      },
      { new: true }
    ).lean()
  }
}

export const projectService = {
  createProject,
  getAllProject,
  getProjectById,
  getProjectByContractorId,
  updateProject,
  deleteProject,
  likeProject
}
