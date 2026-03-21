import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import type { CookieOptions } from 'express'

import { HttpStatus } from '@/constants/http.constants'
import { IAuthConstants } from '@/constants/auth.constants'

import { authValidation } from '@/validation/auth.validation'

import { authService } from '@/services/auth/auth.service'
import { refreshTokenService } from '@/services/refreshToken/refreshToken.service'

const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME as string

const getRefreshCookieOptions = (): CookieOptions => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const expiresInSeconds = parseInt(process.env.EXPIRES_REFRESHTOKEN as string)

  return {
    // XSS attack
    httpOnly: true,
    secure: isDevelopment,
    // CSRF attack
    sameSite: 'lax',
    path: '/api/auth',
    // Set the cookie lifespan
    maxAge: Number.isFinite(expiresInSeconds) ? expiresInSeconds * 1000 : undefined
  }
}

const generateAccessToken = (user: IAuthConstants) => {
  return jwt.sign(user, process.env.SECRET_KEY_ACCESSTOKEN as string, {
    expiresIn: parseInt(process.env.EXPIRES_ACCESSTOKEN as string)
  })
}

const generateRefreshToken = async (user: IAuthConstants) => {
  const refreshToken = jwt.sign(user, process.env.SECRET_KEY_REFRESHTOKEN as string, {
    expiresIn: parseInt(process.env.EXPIRES_REFRESHTOKEN as string)
  })

  await refreshTokenService.save(refreshToken, user.email)

  return refreshToken
}

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  const validation = authValidation(email, password)

  if (Object.keys(validation).length > 0) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Validation error',
      errors: validation
    })
    return
  }

  const userCheckLogin = await authService.checkLoginAuth(email, password)

  if (!userCheckLogin) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Incorrect email or password'
    })
    return
  }

  const dataUser: IAuthConstants = {
    id: userCheckLogin._id.toString(),
    email: userCheckLogin.email ?? '',
    fullName: userCheckLogin.fullName ?? '',
    phone: userCheckLogin.phone ?? undefined,
    avatar: userCheckLogin.avatar ?? undefined,
    birthday: userCheckLogin.birthday ?? undefined,
    gender: userCheckLogin.gender ?? undefined,
    citizenIdNumber: userCheckLogin.citizenIdNumber ?? undefined,
    description: userCheckLogin.description ?? undefined,
    address: userCheckLogin.address ?? undefined,
    role: userCheckLogin.role ?? undefined
  }

  const accessToken = generateAccessToken(dataUser)
  const refreshToken = await generateRefreshToken(dataUser)

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshCookieOptions())

  res.status(HttpStatus.OK).json({
    message: 'Login successfully',
    data: {
      accessToken,
      user: dataUser
    }
  })
})

const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookieRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined
  const { refreshToken: bodyRefreshToken } = req.body as { refreshToken?: string }
  const refreshToken = cookieRefreshToken ?? bodyRefreshToken

  if (refreshToken) {
    await refreshTokenService.delete(refreshToken)
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshCookieOptions())

  res.status(HttpStatus.OK).json({
    message: 'Logged out successfully'
  })
})

const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const cookieRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined
  const { refreshToken: bodyRefreshToken } = req.body as { refreshToken?: string }
  const refreshToken = cookieRefreshToken ?? bodyRefreshToken

  if (!refreshToken) {
    res.status(HttpStatus.FORBIDDEN).json({
      message: 'You are not authenticated'
    })
    return
  }

  let decoded: (IAuthConstants & { iat?: number; exp?: number }) | null = null

  try {
    decoded = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESHTOKEN as string) as IAuthConstants & {
      iat?: number
      exp?: number
    }
  } catch {
    res.status(HttpStatus.FORBIDDEN).json({
      message: 'Refresh token is not valid'
    })
    return
  }

  const tokenExists = await refreshTokenService.exists(refreshToken)

  if (!tokenExists) {
    res.status(HttpStatus.FORBIDDEN).json({
      message: 'Refresh token does not exist'
    })
    return
  }

  const payload = decoded as unknown as IAuthConstants & { iat?: number; exp?: number }
  delete (payload as unknown as Record<string, unknown>).iat
  delete (payload as unknown as Record<string, unknown>).exp

  const newAccessToken = generateAccessToken(payload as IAuthConstants)

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshCookieOptions())

  res.status(HttpStatus.OK).json({
    message: 'Refresh token successfully',
    data: {
      accessToken: newAccessToken
    }
  })
})

interface GoogleUser {
  _id?: { toString?: () => string } | string
  id?: { toString?: () => string } | string
  fullName?: string
  email?: string
  phone?: string
  avatar?: string
}

export const googleCallback = asyncHandler(async (req: Request & { user?: GoogleUser }, res: Response) => {
  try {
    const user = req.user
    if (!user) {
      return res.redirect(`${process.env.URL_CLIENT}/login`)
    }

    if (!user.email || !user.fullName) {
      throw new Error('Missing required user fields from Google profile')
    }

    const userId =
      typeof user._id === 'string'
        ? user._id
        : (user._id?.toString?.() ?? (typeof user.id === 'string' ? user.id : user.id?.toString?.()))

    if (!userId) {
      throw new Error('Missing user id from Google profile')
    }

    const value: IAuthConstants = {
      id: userId,
      fullName: user.fullName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? undefined,
      avatar: user.avatar ?? undefined
    }

    const accessToken = authController.generateAccessToken(value)
    const refreshToken = await authController.generateRefreshToken(value)

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, getRefreshCookieOptions())

    // Redirect frontend + accessToken
    res.redirect(`${process.env.URL_CLIENT}/auth/success?accessToken=${accessToken}`)
  } catch (err) {
    console.error(err)
    res.redirect(`${process.env.URL_CLIENT}/login`)
  }
})

export const authController = {
  login,
  logout,
  refreshToken,
  generateAccessToken,
  generateRefreshToken
}
