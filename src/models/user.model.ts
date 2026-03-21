import mongoose, { Document } from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    avatar: { type: String },
    email: { type: String, unique: true, maxlength: 100 },
    phone: { type: String, maxlength: 15 },
    password: { type: String, require: true, maxlength: 255 },
    fullName: { type: String, require: true, maxlength: 100 },
    birthday: { type: Date },
    gender: { type: String, enum: ['female', 'male', 'other'], default: 'other' },
    citizenIdNumber: { type: String },
    description: { type: String, maxlength: 255 },
    address: { type: String, maxlength: 255 },

    status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
    role: { type: String, enum: ['freelancer', 'contractor', 'staff', 'admin', 'other'], default: 'other' },

    ratingAvg: { type: Number, default: null },
    ratingCount: { type: Number, default: null },
    contractFavourite: { type: [String], default: null },

    provider: { type: String, default: 'local' },
    googleId: { type: String, default: '' }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: true
  }
)

userSchema.index({ email: 1, citizenIdNumber: 1 }, { unique: true })
export const User = mongoose.model('User', userSchema)

export interface IUser extends Document {
  avatar: string
  email: string
  phone: string
  password: string
  fullName: string
  birthday: string
  gender: 'female' | 'male' | 'other'

  citizenIdNumber: string
  description: string
  address: string
  status: 'active' | 'inactive' | 'banned'
  role: 'freelancer' | 'contractor' | 'staff' | 'admin' | 'other'

  ratingAvg: number
  ratingCount: number
  contractFavourite: string[]
  provider: string
  googleId?: string
}
