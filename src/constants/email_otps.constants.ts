export interface IEmailOtp {
  email: string
  otpHash: string
  attempts: number
  expiresAt: Date
  lastSentAt: Date
}