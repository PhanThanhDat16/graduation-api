import express from 'express'
import { emailOtpController } from '@/controllers/email_otps/email_otps.controller'

const router = express.Router()

// router.post('/send-otp', emailOtpController.sendOtpController)
// router.post('/verify-otp', emailOtpController.verifyOtpController)
router.post('/resend-otp', emailOtpController.resendOTP)
// router.get('/get-all-otp', emailOtpController.getAllRecordOtp)
// router.get('/get-otp-by-email/:email', emailOtpController.getRecordByEmail)

export const emailOtpRouter = router
