import mongoose from 'mongoose'

export interface IAdminHistory extends Document {
  adminId: mongoose.Schema.Types.ObjectId
  contractId?: mongoose.Schema.Types.ObjectId
  disputeId?: mongoose.Schema.Types.ObjectId
  userId?: mongoose.Schema.Types.ObjectId
  action: string
  note: string
}

const adminHistorySchema = new mongoose.Schema<IAdminHistory>(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DisputeForm'
    },
    action: {
      type: String,
      required: true
    },
    note: {
      type: String,
      required: true
    }
  },
  {
    versionKey: false,
    strict: true,
    collection: 'admin_history'
  }
)

adminHistorySchema.index({ adminId: 1, contractId: 1, disputeId: 1 })

export const AdminHistory = mongoose.model<IAdminHistory>('AdminHistory', adminHistorySchema)
