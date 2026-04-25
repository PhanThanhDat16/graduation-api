import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '@/models/user.model'

export const authService = {
  checkLoginAuth: async (email: string, password: string) => {
    const existingUser = await User.findOne({ email }).lean()

    if (!existingUser) return false
    if (!existingUser.isVerified) return false

    const passwordMatch = await bcrypt.compare(password, existingUser.password as string)
    if (!passwordMatch) return false

    return existingUser
  },

  findOne: async (email: string) => {
    const existingUser = await User.findOne({ email }).lean()
    if (!existingUser) return false

    return existingUser
  },

  resetPassword: async (email: string, newPassword: string, resetToken: string) => {
    let payload: any

    try {
      payload = jwt.verify(resetToken, process.env.SECRET_KEY_ACCESSTOKEN!)
    } catch (err) {
      throw new Error('Invalid or expired reset token')
    }

    if (!payload || payload.type !== 'reset_password' || !payload.email) {
      throw new Error('Invalid reset token')
    }

    const payloadEmail = payload.email

    if (email !== payloadEmail) {
      throw new Error('Invalid reset token or email')
    }

    const user = await User.findOne({ email: payloadEmail })

    if (!user) {
      throw new Error('Invalid request')
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10)

    await User.findOneAndUpdate({ email: payloadEmail }, { password: newHashedPassword })

    return { message: 'Password reset successfully' }
  }
}
