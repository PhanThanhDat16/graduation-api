import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { userService } from '@/services/user/user.service'

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
    role
  })
  if (!user) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User already exists',
      error: 'User already exists'
    })
    return
  }

  res.status(HttpStatus.OK).json({ message: 'register successfully', data: user })
})

export const userController = {
  register
}
