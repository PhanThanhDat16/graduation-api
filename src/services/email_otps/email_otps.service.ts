import transporter from '@/config/nodemailer'
import { EmailOtp } from '@/models/email_otps.model'
import { User } from '@/models/user.model'
import bcrypt from 'bcrypt'

const OTP_LENGTH = 6
const OTP_EXPIRES_MINUTES = 5
const MAX_OTP_ATTEMPTS = 5
const RESEND_COOLDOWN = 60 * 1000

/** Generate a random numeric OTP of the given length */
const generateOtp = (length: number = OTP_LENGTH) => {
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString()
  }
  return otp
}

const generatePassword = (
  length: number = 8,
  options = {
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true
  }
) => {
  let chars = ''

  if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.numbers) chars += '0123456789'
  if (options.symbols) chars += '!@#$%^&*()_+{}[]<>?'

  if (!chars) throw new Error('Must choose at least one type of character')

  let password = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    password += chars[randomIndex]
  }

  return password
}

const messageSend = (email: string, otpCode: string, subject: string) => {
  const mailOptions = {
    from: `"DevFreelance " <${process.env.AUTH_EMAIL}>`,
    to: email,
    subject: subject,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #333;">${subject}</h2>
            <p>Your ${subject} code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;
                        background: #f4f4f4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            ${otpCode}
            </div>
            <p style="color: #666;">This code will expire in <strong>${OTP_EXPIRES_MINUTES} minutes</strong>.</p>
            <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
        `
  }
  return mailOptions
}

type OtpPurpose = 'register' | 'forgot_password' | 'change_email'

/** Send a 6-digit OTP to the user's email via nodemailer or resendOTP*/
const sendOtpToEmail = async (
  email: string,
  purpose: OtpPurpose,
  options?: { requireExisting?: boolean; subject?: string }
) => {
  const now = new Date()

  const existing = await EmailOtp.findOne({ email, purpose })

  // rate limit
  if (options?.requireExisting && !existing) {
    throw new Error('No OTP request found. Please request a new OTP.')
  }

  if (existing?.lastSentAt) {
    const diff = now.getTime() - existing.lastSentAt.getTime()
    if (diff < RESEND_COOLDOWN) {
      throw new Error('Please wait before requesting another OTP')
    }
  }

  const otpCode = generateOtp()
  const otpHash = await bcrypt.hash(otpCode, 10)
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000)

  // Upsert: create or replace existing OTP for this email
  await EmailOtp.findOneAndUpdate(
    { email, purpose },
    { otpHash, attempts: 0, expiresAt, lastSentAt: now },
    { upsert: true, new: true }
  )

  await transporter.sendMail(messageSend(email, otpCode, options?.subject || 'Your Verification Code') as any)
  return { message: 'OTP sent successfully', expiresAt }
}

/** Send password to email */
const sendPasswordToEmail = async(email: string) => {
  const password = generatePassword(10, {
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true
  })

  const passwordHash = await bcrypt.hash(password, 10)

  await User.findOneAndUpdate({ email }, { password: passwordHash })

  await transporter.sendMail(messageSend(email, password, 'Your temporary password') as any)

  return { message: 'Password sent successfully' }
}

/** Verify the OTP code submitted by the user */
const verifyEmail = async (email: string, otpCode: string, purpose: OtpPurpose) => {
  const otpRecord = await EmailOtp.findOne({ email, purpose })

  if (!otpRecord) {
    throw new Error("Can't find OTP match with this Email.")
  }

  if (!otpRecord.expiresAt || otpRecord.expiresAt < new Date()) {
    await EmailOtp.deleteOne({ email, purpose })
    throw new Error('OTP has expired. Please request a new OTP.')
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await EmailOtp.deleteOne({ email, purpose })
    throw new Error('Too many failed attempts. Please request a new OTP.')
  }

  const isMatch = await bcrypt.compare(otpCode, otpRecord.otpHash)

  if (!isMatch) {
    otpRecord.attempts += 1
    await otpRecord.save()
    throw new Error('Invalid OTP code.')
  }

  // OTP is valid — mark the user as verified (only for register purpose)
  if (purpose === 'register') {
    await User.findOneAndUpdate({ email }, { isVerified: true })
  }
  await EmailOtp.deleteOne({ email, purpose })

  return { message: 'Email verified successfully' }
}

const getRecordByEmail = async (email: string) => {
  return await EmailOtp.findOne({ email })
}

const getAllRecordOtp = async () => {
  return await EmailOtp.find()
}

export const emailOtpService = {
  sendOtpToEmail,
  verifyEmail,
  getRecordByEmail,
  getAllRecordOtp,
  sendPasswordToEmail
}
