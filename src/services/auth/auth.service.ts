import bcrypt from 'bcrypt'

import { User } from '@/models/user.model'

export const authService = {
  checkLoginAuth: async (email: string, password: string) => {
    const existingUser = await User.findOne({ email }).lean()

    if (!existingUser) return false

    const passwordMatch = await bcrypt.compare(password, existingUser.password as string)
    if (!passwordMatch) return false

    return existingUser
  },

  findOne: async (email: string) => {
    const existingUser = await User.findOne({ email }).lean()
    if (!existingUser) return false

    return existingUser
  }
}
