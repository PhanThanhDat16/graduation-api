import { emailOtpService } from "@/services/email_otps/email_otps.service"
import { Request, Response } from "express"
import expressAsyncHandler from "express-async-handler"
import { HttpStatus } from '@/constants/http.constants'

const sendOtpController = expressAsyncHandler(async (req: Request, res: Response) => {
    const email = req.body.email;

    if(!email) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email is required' })
        return
    }

    const result = await emailOtpService.sendOtpToEmail(email)
    res.status(HttpStatus.OK).json({
        message: result.message,
        expiresAt: result.expiresAt
    })
})

const verifyOtpController = expressAsyncHandler(async (req: Request, res: Response) => {
    const {email, otp} = req.body;

    if(!email || !otp) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email and OTP are required' })
        return
    }

    const result = await emailOtpService.verifyEmail(email, otp)
    res.status(HttpStatus.OK).json({
        message: result.message,
    })
})

const resendOTP = expressAsyncHandler(async (req: Request, res: Response) => {
    const email = req.body.email;

    if(!email) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email is required' })
        return
    }

    const result = await emailOtpService.sendOtpToEmail(email, { requireExisting: true, subject: 'Resend OTP' })
    res.status(HttpStatus.OK).json({
        message: result.message,
        expiresAt: result.expiresAt 
    })
})

const getAllRecordOtp = expressAsyncHandler(async (req: Request, res: Response) => {
    const result = await emailOtpService.getAllRecordOtp()
    res.status(HttpStatus.OK).json({
        message: 'Get all OTP records successfully',
        data: result
    })
})

const getRecordByEmail = expressAsyncHandler(async (req: Request, res: Response) => {
    const email = req.params.email;

    if(!email) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email is required' })
        return
    }

    const result = await emailOtpService.getRecordByEmail(email)
    res.status(HttpStatus.OK).json({
        message: 'Get OTP record successfully',
        data: result
    })
})

export const emailOtpController = {
    sendOtpController,
    verifyOtpController,
    resendOTP,
    getAllRecordOtp,
    getRecordByEmail
}
