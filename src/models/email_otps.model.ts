import mongoose, { Document } from "mongoose";

const emailOtpSchema = new mongoose.Schema<IEmailOtp>(
  {
    email: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['register', 'forgot_password'],
      required: true
    },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: '0s' } },
    lastSentAt: { type: Date, required: true }
  },
  {
    timestamps: true
  }
)

export const EmailOtp = mongoose.model<IEmailOtp>('EmailOtp', emailOtpSchema)

export interface IEmailOtp extends Document {
  email: string
  purpose: 'register' | 'forgot_password'
  otpHash: string
  attempts: number
  expiresAt: Date
  lastSentAt: Date
}