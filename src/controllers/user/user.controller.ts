import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { userService } from '@/services/user/user.service'
import { emailOtpService } from '@/services/email_otps/email_otps.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'

const register = expressAsyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName, phone, address, birthday, gender, role = 'other' } = req.body

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await userService.registerUser({
    email: email as string,
    password: hashedPassword,
    fullName,
    phone: phone as string,
    address,
    birthday,
    gender,
    role,
    isVerified: false
  })

  if (!user) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User already exists',
      error: 'User already exists'
    })
    return
  }

  await emailOtpService.sendOtpToEmail(email, 'register', { subject: 'Verify Your Email' })

  res
    .status(HttpStatus.OK)
    .json({ message: 'register successfully. Please check OTP in your email to verify', data: user })
})

const registerStaff = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { email, password, fullName, phone, address, birthday, gender, role = 'staff' } = req.body
  const isAllowed = req.user?.role;

  if (!isAllowed) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
    return
  }

  if (isAllowed !== "admin") {
    res.status(HttpStatus.FORBIDDEN).json({
      message: 'You do not have permission to perform this action'
    })
    return
  }
  

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await userService.registerUser({
    email: email as string,
    password: hashedPassword,
    fullName,
    phone: phone as string,
    address,
    birthday,
    gender,
    role,
    isVerified: true
  })

  if (!user) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User already exists',
      error: 'User already exists'
    })
    return
  }

  res.status(HttpStatus.OK).json({ message: 'register staff successfully', data: user })
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
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const user = await userService.deleteUser(id as string)
  res.status(HttpStatus.OK).json({
    message: user.message
  })
})

const getProfile = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
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
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
    return
  }

  const { fullName, phone, address, birthday, gender, description, avatar, backgroundAvatar, isVerified } = req.body

  const user = await userService.updateProfile(userId as string, {
    fullName,
    phone,
    address,
    birthday,
    gender,
    description,
    avatar,
    backgroundAvatar,
    isVerified
  })

  res.status(HttpStatus.OK).json({
    message: 'Update profile successfully',
    data: user
  })
})

// update by admin
const updateUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const { email, fullName, phone, address, birthday, gender, role, isVerified } = req.body

  const user = await userService.updateUser(id as string, {
    email: email as string,
    fullName,
    phone: phone as string,
    address,
    birthday,
    gender,
    role,
    isVerified
  })

  res.status(HttpStatus.OK).json({
    message: 'Update user successfully',
    data: user
  })
})

const updatePassword = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
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
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
    return
  }

  const { newEmail, otp } = req.body

  if (!newEmail || !otp) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'New email and OTP are required'
    })
    return
  }

  await emailOtpService.verifyEmail(newEmail, otp, 'change_email')

  const user = await userService.updateEmail(userId as string, newEmail)

  res.status(HttpStatus.OK).json({
    message: 'Email updated successfully',
    data: user
  })
})

const requestEmailChangeOtp = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const { newEmail, purpose } = req.body

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
    return
  }

  if (!newEmail) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'New email is required'
    })
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
  requestEmailChangeOtp,
  registerStaff
}
