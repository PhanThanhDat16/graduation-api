import { EProjectStatus } from '@/constants/project.constant'
import mongoose, { Document } from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    skills: { type: [String], default: [] },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    images: { type: [String], default: [] },
    status: { type: String, enum: EProjectStatus, default: 'draft' },
    likes: { type: Number, default: 0 },
    listLike: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }
  },
  { timestamps: true }
)

projectSchema.index({ contractorId: 1, status: 1, category: 1 })

export const Project = mongoose.model('Project', projectSchema)

export interface IProject extends Document {
  contractorId: mongoose.Types.ObjectId
  title: string
  description: string
  category: string
  skills: string[]
  budgetMin: number
  budgetMax: number
  status: EProjectStatus
  likes: number
  listLike: mongoose.Types.ObjectId[]
  images: string[]
  createdAt: Date
  updatedAt: Date
}
