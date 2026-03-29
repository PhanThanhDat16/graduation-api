import mongoose, { Document } from 'mongoose'

export const CONTRACT_STATUS = [
  'draft',
  'pending_agreement',
  'waiting_payment',
  'running',
  'submitted',
  'completed',
  'dispute',
  'cancelled'
] as const

export const ESCROW_STATUS = ['pending', 'partial', 'funded', 'locked', 'released', 'refunded', 'split'] as const

const contractSchema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },

    contractor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    description: { type: String },

    contractor_terms: { type: String },
    freelancer_terms: { type: String },

    // Số tiền dự án (freelancer sẽ nhận được khi hoàn thành)
    total_amount: { type: Number, required: true, min: 0 },

    // Phí admin (platform thu)
    admin_fee: { type: Number, default: 0, min: 0 },

    // Tiền đặt cọc freelancer phải đóng (để cam kết, hoàn lại khi hoàn thành)
    freelancer_deposit: { type: Number, default: 0, min: 0 },

    contractor_agreed: { type: Boolean, default: false },
    freelancer_agreed: { type: Boolean, default: false },

    deadline: { type: Date },

    // Payment tracking
    contractor_paid: { type: Boolean, default: false },
    freelancer_paid: { type: Boolean, default: false },

    // Số tiền thực tế đã đóng
    contractor_paid_amount: { type: Number, default: 0, min: 0 },
    freelancer_paid_amount: { type: Number, default: 0, min: 0 },

    deadline_paid: { type: Date },
    contractor_paid_at: { type: Date },
    freelancer_paid_at: { type: Date },

    // Admin
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    admin_approved_at: { type: Date },
    admin_rejection_reason: { type: String },

    // Timeline
    start_at: { type: Date },
    end_at: { type: Date },

    // Extend
    expand_count: { type: Number, default: 0 },
    expand_deadline: { type: Date },

    status: { type: String, enum: CONTRACT_STATUS, default: 'draft' },

    // Escrow tracking
    total_escrow_amount: { type: Number, default: 0, min: 0 }, // Tổng tiền trong escrow

    // Release/Refund tracking
    released_to_freelancer: { type: Number, default: 0, min: 0 },
    refunded_to_contractor: { type: Number, default: 0, min: 0 },
    refunded_to_freelancer: { type: Number, default: 0, min: 0 }, // Hoàn deposit cho freelancer
    admin_fee_collected: { type: Number, default: 0, min: 0 },

    escrow_status: { type: String, enum: ESCROW_STATUS, default: 'pending' },
    last_updated_at: { type: Date }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: true
  }
)

contractSchema.index({ project_id: 1, contractor_id: 1, freelancer_id: 1, status: 1, escrow_status: 1 })

export const Contract = mongoose.model('Contract', contractSchema)

export interface IContract extends Document {
  project_id: mongoose.Types.ObjectId
  application_id?: mongoose.Types.ObjectId

  contractor_id: mongoose.Types.ObjectId
  freelancer_id: mongoose.Types.ObjectId

  description?: string

  contractor_terms?: string
  freelancer_terms?: string

  total_amount: number
  admin_fee: number
  freelancer_deposit: number

  contractor_agreed: boolean
  freelancer_agreed: boolean

  deadline?: Date

  contractor_paid: boolean
  freelancer_paid: boolean
  contractor_paid_amount: number
  freelancer_paid_amount: number

  deadline_paid?: Date
  contractor_paid_at?: Date
  freelancer_paid_at?: Date

  admin_id?: mongoose.Types.ObjectId
  admin_approved_at?: Date
  admin_rejection_reason?: string

  start_at?: Date
  end_at?: Date

  expand_count: number
  expand_deadline?: Date

  status: (typeof CONTRACT_STATUS)[number]

  total_escrow_amount: number

  released_to_freelancer: number
  refunded_to_contractor: number
  refunded_to_freelancer: number
  admin_fee_collected: number

  escrow_status: (typeof ESCROW_STATUS)[number]
  last_updated_at?: Date

  createdAt: Date
  updatedAt: Date
}
