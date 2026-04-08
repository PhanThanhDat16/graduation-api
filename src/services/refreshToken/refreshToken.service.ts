import { RefreshToken } from '@/models/refreshToken.model'

export const refreshTokenService = {
  save: async (accessToken: string, refreshToken: string, email: string) => {
    return await RefreshToken.create({ accessToken, refreshToken, email })
  },

  exists: async (refreshToken: string) => {
    return await RefreshToken.findOne({ refreshToken })
  },

  delete: async (refreshToken: string) => {
    return await RefreshToken.deleteOne({ refreshToken })
  },

  deleteByAccessToken: async (accessToken: string) => {
    return await RefreshToken.deleteOne({ accessToken })
  },

  deleteAllForUser: async (email: string) => {
    return await RefreshToken.deleteMany({ email })
  }
}
