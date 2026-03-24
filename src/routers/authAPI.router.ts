import express from 'express'
import { authController } from '@/controllers/auth/auth.controller'

const router = express.Router()

router.post('/login', authController.login)
router.post('/refresh-token', authController.refreshToken)
router.post('/logout', authController.logout)
router.post('/forgot-password/request', authController.forgotPassword_requestOtp)
router.post('/forgot-password/verify', authController.forgotPassword_verifyOtp)
router.post('/forgot-password/reset', authController.forgotPassword_resetPassword)

export const routerAuth = router
