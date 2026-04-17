import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { userService } from '@/services/user/user.service'
import { emailOtpService } from '@/services/email_otps/email_otps.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'

const register = expressAsyncHandler(async (req: Request, res: Response) => {
  const user = await userService.registerUser({
    ...req.body,
    isVerified: false
  })

  await emailOtpService.sendOtpToEmail(user.email, 'register', { subject: 'Verify Your Email' })

  res.status(HttpStatus.OK).json({
    message: 'Register successfully. Please check OTP in your email to verify',
    data: user
  })
})

const getAllUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { page, limit, sortBy, sortOrder, role, status, isVerified, keyword } = req.query

  const filter = {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
    role: role as any,
    status: status as any,
    isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
    keyword: keyword as string
  }

  const result = await userService.getAllUser(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all users successfully',
    ...result
  })
})

const getUserById = expressAsyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id as string)
  res.status(HttpStatus.OK).json({
    message: 'Get user successfully',
    data: user
  })
})

const deleteUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req.params.id as string)
  res.status(HttpStatus.OK).json({
    message: result.message
  })
})

const getProfile = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const user = await userService.getProfile(userId as string)
  res.status(HttpStatus.OK).json({
    message: 'Get profile successfully',
    data: user
  })
})

const updateProfile = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const user = await userService.updateProfile(userId as string, req.body)

  res.status(HttpStatus.OK).json({
    message: 'Update profile successfully',
    data: user
  })
})

// update by admin
const updateUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id as string, req.body)

  res.status(HttpStatus.OK).json({
    message: 'Update user successfully',
    data: user
  })
})

const updatePassword = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Current password and new password are required'
    })
    return
  }

  const result = await userService.updatePassword(userId as string, currentPassword, newPassword)

  res.status(HttpStatus.OK).json({
    message: result.message
  })
})

const updateEmail = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' })
    return
  }

  const { oldEmail, newEmail, otp } = req.body
  if (!newEmail || !otp) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'New email and OTP are required'
    })
    return
  }

  await emailOtpService.verifyEmail(oldEmail, otp, 'change_email')
  const user = await userService.updateEmail(userId as string, newEmail)

  res.status(HttpStatus.OK).json({
    message: 'Email updated successfully',
    data: user
  })
})

const requestEmailChangeOtp = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { newEmail, purpose } = req.body
  if (!newEmail) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'New email is required' })
    return
  }

  const result = await emailOtpService.sendOtpToEmail(newEmail, purpose, { subject: 'Verify Your New Email' })

  res.status(HttpStatus.OK).json({
    message: result.message,
    expiresAt: result.expiresAt
  })
})

export const userController = {
  register,
  getAllUser,
  getUserById,
  deleteUser,
  updateUser,
  getProfile,
  updateProfile,
  updatePassword,
  updateEmail,
  requestEmailChangeOtp
}
