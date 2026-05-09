import { EApplicationStatus } from '@/constants/application.constant'
import mongoose, { Document } from 'mongoose'

const applicationSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    proposal: { type: String, required: true },
    proposedBudget: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now }
  },
  {
    versionKey: false,
    strict: true
  }
)

applicationSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true })
applicationSchema.index({ projectId: 1, status: 1 })

export const Application = mongoose.model('Application', applicationSchema)

export interface IApplication extends Document {
  projectId: mongoose.Types.ObjectId
  freelancerId: mongoose.Types.ObjectId
  proposal: string
  proposedBudget: number
  status: EApplicationStatus
  appliedAt: Date
}
