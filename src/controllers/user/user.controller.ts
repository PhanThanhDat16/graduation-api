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

  await emailOtpService.sendOtpToEmail(email, { subject: 'Verify Your Email' })

  res.status(HttpStatus.OK).json({ message: 'register successfully. Please check OTP in your email to verify', data: user })
})

const getAllUser = expressAsyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUser()
  res.status(HttpStatus.OK).json({
    message: 'Get all users successfully',
    data: users
  })
})

const getUserById = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await userService.getUserById(id)
  res.status(HttpStatus.OK).json({
    message: 'Get user successfully',
    data: user
  })
})

export const userController = {
  register,
  getAllUser,
  getUserById
}
