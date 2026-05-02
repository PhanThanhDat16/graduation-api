import { EContractStatus, EEscrowStatus } from '@/constants/contract.constants'
import mongoose, { Document } from 'mongoose'

const contractSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },

    contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    description: { type: String },

    contractorTerms: { type: String },
    freelancerTerms: { type: String },

    // Số tiền dự án (freelancer sẽ nhận được khi hoàn thành)
    totalAmount: { type: Number, required: true, min: 0 },

    // Phí admin (platform thu)
    adminFee: { type: Number, default: 0, min: 0 },

    // Tiền đặt cọc freelancer phải đóng (để cam kết, hoàn lại khi hoàn thành)
    freelancerDeposit: { type: Number, default: 0, min: 0 },

    contractorAgreed: { type: Boolean, default: false },
    freelancerAgreed: { type: Boolean, default: false },

    deadline: { type: Date },

    // Payment tracking
    contractorPaid: { type: Boolean, default: false },
    freelancerPaid: { type: Boolean, default: false },

    // Số tiền thực tế đã đóng
    contractorPaidAmount: { type: Number, default: 0, min: 0 },
    freelancerPaidAmount: { type: Number, default: 0, min: 0 },

    deadlinePaid: { type: Date },
    contractorPaidAt: { type: Date },
    freelancerPaidAt: { type: Date },

    // Admin
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminApprovedAt: { type: Date },
    adminRejectionReason: { type: String },

    // Timeline
    startAt: { type: Date },
    endAt: { type: Date },

    // Extend
    expandCount: { type: Number, default: 0 },
    expandDeadline: { type: Date },

    // Submission links (freelancer)
    githubLink: { type: String },
    webLink: { type: String },
    submittedAt: { type: Date },

    status: { type: String, enum: EContractStatus, default: EContractStatus.DRAFT },

    // Escrow tracking
    totalEscrowAmount: { type: Number, default: 0, min: 0 }, // Tổng tiền trong escrow

    // Release/Refund tracking
    releasedToFreelancer: { type: Number, default: 0, min: 0 },
    refundedToContractor: { type: Number, default: 0, min: 0 },
    refundedToFreelancer: { type: Number, default: 0, min: 0 }, // Hoàn deposit cho freelancer
    adminFeeCollected: { type: Number, default: 0, min: 0 },

    escrowStatus: { type: String, enum: EEscrowStatus, default: 'pending' },
    lastUpdatedAt: { type: Date }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: true
  }
)

contractSchema.index({ projectId: 1, contractorId: 1, freelancerId: 1, status: 1, escrowStatus: 1 })

export const Contract = mongoose.model('Contract', contractSchema)

export interface IContract extends Document {
  projectId: mongoose.Types.ObjectId
  applicationId?: mongoose.Types.ObjectId

  contractorId: mongoose.Types.ObjectId
  freelancerId: mongoose.Types.ObjectId

  description?: string

  contractorTerms?: string
  freelancerTerms?: string

  totalAmount: number
  adminFee: number
  freelancerDeposit: number

  contractorAgreed: boolean
  freelancerAgreed: boolean

  deadline?: Date

  contractorPaid: boolean
  freelancerPaid: boolean
  contractorPaidAmount: number
  freelancerPaidAmount: number

  deadlinePaid?: Date
  contractorPaidAt?: Date
  freelancerPaidAt?: Date

  adminId?: mongoose.Types.ObjectId
  adminApprovedAt?: Date
  adminRejectionReason?: string

  startAt?: Date
  endAt?: Date

  expandCount: number
  expandDeadline?: Date

  githubLink?: string
  webLink?: string
  submittedAt?: Date

  status: EContractStatus

  totalEscrowAmount: number

  releasedToFreelancer: number
  refundedToContractor: number
  refundedToFreelancer: number
  adminFeeCollected: number

  escrowStatus: EEscrowStatus
  lastUpdatedAt?: Date

  createdAt: Date
  updatedAt: Date
}
