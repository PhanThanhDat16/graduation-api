import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { userService } from '@/services/user/user.service'
import { emailOtpService } from '@/services/email_otps/email_otps.service'

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

  res.status(HttpStatus.OK).json({ message: 'register successfully. Please check OTP in your email to verify', data: user })
})

const getAllUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query;

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,

    role: query.role,
    status: query.status,
    isVerified:
      query.isVerified !== undefined
        ? query.isVerified === 'true'
        : undefined,

    keyword: query.keyword
  }

  const result = await userService.getAllUser(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all users successfully',
    ...result
  })
})

const getUserById = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await userService.getUserById(id as string)
  res.status(HttpStatus.OK).json({
    message: 'Get user successfully',
    data: user
  })
})

const updateUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required',
    })
    return
  }

  const { email, password, fullName, phone, address, birthday, gender, role = 'other' } = req.body

  const user = await userService.updateUser(id as string, {
    email: email as string,
    password: password as string,
    fullName,
    phone: phone as string,
    address,
    birthday,
    gender,
    role,
    isVerified: false
  })

  res.status(HttpStatus.OK).json({
    message: 'Update user successfully',
    data: user
  })
})

const deleteUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required',
    })
    return
  }

  const user = await userService.deleteUser(id as string)
  res.status(HttpStatus.OK).json({
    message: user.message,
  })

})

export const userController = {
  register,
  getAllUser,
  getUserById,
  deleteUser,
  updateUser
}
