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
    const result = await RefreshToken.deleteOne({ accessToken })

    if (result.deletedCount === 0) {
      throw new Error('Access token not found')
    }

    return true
  },

  deleteAllForUser: async (email: string) => {
    return await RefreshToken.deleteMany({ email })
  }
}
