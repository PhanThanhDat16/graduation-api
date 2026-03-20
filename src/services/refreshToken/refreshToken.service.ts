import { RefreshToken } from '@/models/refreshToken.model'

export const refreshTokenService = {
  save: async (token: string, email: string) => {
    return await RefreshToken.create({ token, email })
  },

  exists: async (token: string) => {
    return await RefreshToken.findOne({ token })
  },

  delete: async (token: string) => {
    return await RefreshToken.deleteOne({ token })
  },

  deleteAllForUser: async (email: string) => {
    return await RefreshToken.deleteMany({ email })
  }
}
