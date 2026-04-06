import mongoose from "mongoose";

export interface IAdminHistory extends Document {
    admin_id: mongoose.Schema.Types.ObjectId
    contract_id?: mongoose.Schema.Types.ObjectId
    dispute_id?: mongoose.Schema.Types.ObjectId
    user_id?: mongoose.Schema.Types.ObjectId
    action: string
    note: string
}

const adminHistorySchema = new mongoose.Schema<IAdminHistory>(
    {
        admin_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        },
        contract_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contract'
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        dispute_id: {
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
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
)

adminHistorySchema.index({ admin_id: 1, contract_id: 1, dispute_id: 1 })

export const AdminHistory = mongoose.model<IAdminHistory>('AdminHistory', adminHistorySchema)