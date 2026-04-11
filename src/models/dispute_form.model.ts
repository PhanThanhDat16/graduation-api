import { EResolutionType } from '@/constants/contract.constants'
import { EDisputeStatus } from '@/constants/dispute_form.constants'
import mongoose, { Document } from 'mongoose'

const disputeFormSchema = new mongoose.Schema(
  {
    contract_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },

    contractor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Ai mở dispute
    opened_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    status: { type: String, enum: EDisputeStatus, default: 'open' },

    resolution_type: { type: String, enum: EResolutionType },

    contractor_reason: { type: String },
    freelancer_reason: { type: String },

    contractor_requested_resolution: { type: String },
    freelancer_requested_resolution: { type: String },

    contractor_agreed: { type: Boolean, default: false },
    freelancer_agreed: { type: Boolean, default: false },

    // Số tiền phân chia khi resolve
    freelancer_amount: { type: Number, default: 0, min: 0 },
    contractor_amount: { type: Number, default: 0, min: 0 },

    // Deadline mới nếu resolution = extend
    new_deadline: { type: Date },

    // Admin
    admin_decision: { type: String },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // 48h deadline để tự động gửi admin
    deadline_send_admin: { type: Date },
    escalated_at: { type: Date },

    resolved_at: { type: Date }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: { createdAt: true, updatedAt: false }
  }
)

disputeFormSchema.index({ contract_id: 1, contractor_id: 1, freelancer_id: 1, status: 1, deadline_send_admin: 1 })

export const DisputeForm = mongoose.model('DisputeForm', disputeFormSchema)

export interface IDisputeForm extends Document {
  contract_id: mongoose.Types.ObjectId

  contractor_id: mongoose.Types.ObjectId
  freelancer_id: mongoose.Types.ObjectId
  opened_by: mongoose.Types.ObjectId

  status: EDisputeStatus

  resolution_type?: EResolutionType

  contractor_reason?: string
  freelancer_reason?: string

  contractor_requested_resolution?: string
  freelancer_requested_resolution?: string

  contractor_agreed: boolean
  freelancer_agreed: boolean

  freelancer_amount: number
  contractor_amount: number

  new_deadline?: Date

  admin_decision?: string
  admin_id?: mongoose.Types.ObjectId

  deadline_send_admin?: Date
  escalated_at?: Date

  createdAt: Date
  resolved_at?: Date
}
