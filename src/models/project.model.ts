import mongoose, { Document } from 'mongoose'

export const PROJECT_STATUS = ['draft', 'open', 'closed'] as const

const projectSchema = new mongoose.Schema(
  {
    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    skills: { type: [String], default: [] },
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    status: { type: String, enum: PROJECT_STATUS, default: 'draft' },
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
  status: (typeof PROJECT_STATUS)[number]
  likes: number
  listLike: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}
