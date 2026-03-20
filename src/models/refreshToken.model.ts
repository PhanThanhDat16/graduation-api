import mongoose from 'mongoose'

const refreshTokenSchema = new mongoose.Schema(
  {
    token: { type: String, require: true, unique: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: process.env.MONGODB_EXPRIES_REFRESHTOKEN }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: true
  }
)

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)
