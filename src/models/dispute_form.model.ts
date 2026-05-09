import { EResolutionType } from '@/constants/contract.constants'
import { EDisputeStatus } from '@/constants/dispute_form.constants'
import mongoose, { Document } from 'mongoose'

const disputeFormSchema = new mongoose.Schema(
  {
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },

    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Ai mở dispute
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    status: { type: String, enum: EDisputeStatus, default: 'pending_reasons' },

    resolutionType: { type: String, enum: EResolutionType },

    contractorReason: { type: String },
    freelancerReason: { type: String },

    contractorRequestedResolution: { type: String },
    freelancerRequestedResolution: { type: String },

    contractorAgreed: { type: Boolean, default: false },
    freelancerAgreed: { type: Boolean, default: false },

    // Số tiền phân chia khi resolve
    freelancerAmount: { type: Number, default: 0, min: 0 },
    contractorAmount: { type: Number, default: 0, min: 0 },

    // Deadline mới nếu resolution = extend
    newDeadline: { type: Date },

    // Deadline 1h để cả 2 bên điền reason
    reasonDeadline: { type: Date },

    // Ai nhấn escalate button (sau khi hết countdown)
    escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Staff xử lý dispute
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    staffCancelReason: { type: String },
    staffDecision: { type: String },

    escalatedAt: { type: Date },

    resolvedAt: { type: Date }
  },
  {
    versionKey: false,
    strict: true,
    collection: 'dispute_forms'
  }
)

disputeFormSchema.index({ contractId: 1, contractorId: 1, freelancerId: 1, status: 1 })

export const DisputeForm = mongoose.model('DisputeForm', disputeFormSchema)

export interface IDisputeForm extends Document {
  contractId: mongoose.Types.ObjectId

  contractorId: mongoose.Types.ObjectId
  freelancerId: mongoose.Types.ObjectId
  openedBy: mongoose.Types.ObjectId

  status: EDisputeStatus

  resolutionType?: EResolutionType

  contractorReason?: string
  freelancerReason?: string

  contractorRequestedResolution?: string
  freelancerRequestedResolution?: string

  contractorAgreed: boolean
  freelancerAgreed: boolean

  freelancerAmount: number
  contractorAmount: number

  newDeadline?: Date

  reasonDeadline?: Date

  escalatedBy?: mongoose.Types.ObjectId

  staffId?: mongoose.Types.ObjectId
  staffCancelReason?: string
  staffDecision?: string

  escalatedAt?: Date

  createdAt: Date
  resolvedAt?: Date
}
