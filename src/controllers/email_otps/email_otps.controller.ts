import { emailOtpService } from '@/services/email_otps/email_otps.service'
import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'
import { HttpStatus } from '@/constants/http.constants'

// const sendOtpController = expressAsyncHandler(async (req: Request, res: Response) => {
//   const { email, purpose } = req.body

//   if (!email || !purpose) {
//     res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email and purpose are required' })
//     return
//   }

//   const result = await emailOtpService.sendOtpToEmail(email, purpose)
//   res.status(HttpStatus.OK).json({
//     message: result.message,
//     expiresAt: result.expiresAt
//   })
// })

const verifyOtpController = expressAsyncHandler(async (req: Request, res: Response) => {
  const { email, otp, purpose } = req.body

  if (!email || !otp || !purpose) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email, OTP and purpose are required' })
    return
  }

  const result = await emailOtpService.verifyEmail(email, otp, purpose)
  res.status(HttpStatus.OK).json({
    message: result.message
  })
})

const resendOTP = expressAsyncHandler(async (req: Request, res: Response) => {
  const { email, purpose } = req.body

  if (!email || !purpose) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Email and purpose are required'
    })
    return
  }

  const result = await emailOtpService.sendOtpToEmail(
    email,
    purpose,
    { subject: 'Resend OTP FOR ' + purpose.toUpperCase() }
  )

  res.status(HttpStatus.OK).json({
    message: result.message,
    expiresAt: result.expiresAt
  })
})

// const getAllRecordOtp = expressAsyncHandler(async (req: Request, res: Response) => {
//   const result = await emailOtpService.getAllRecordOtp()
//   res.status(HttpStatus.OK).json({
//     message: 'Get all OTP records successfully',
//     data: result
//   })
// })

// const getRecordByEmail = expressAsyncHandler(async (req: Request, res: Response) => {
//   const email = req.params.email

//   if (!email) {
//     res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email is required' })
//     return
//   }

//   const result = await emailOtpService.getRecordByEmail(email as string)
//   res.status(HttpStatus.OK).json({
//     message: 'Get OTP record successfully',
//     data: result
//   })
// })

export const emailOtpController = {
  // sendOtpController,
  verifyOtpController,
  resendOTP
  // getAllRecordOtp,
  // getRecordByEmail
}
