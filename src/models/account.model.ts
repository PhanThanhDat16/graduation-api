import mongoose from 'mongoose'


enum EAccountStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export interface IAccount extends Document {
    userId: mongoose.Schema.Types.ObjectId
    code: string
    bankShortName: string
    accountNumber: string
    accountName: string
    logo: string
    status: EAccountStatus
}

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    bankShortName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: EAccountStatus,
        default: EAccountStatus.ACTIVE
    }
}, { timestamps: true })

accountSchema.index({ userId: 1 })
const Account = mongoose.model('Account', accountSchema)

export default Account
