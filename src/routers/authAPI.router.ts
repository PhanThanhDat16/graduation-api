import express from 'express'
import { authController, googleCallback } from '@/controllers/auth/auth.controller'
import passport from 'passport'

const router = express.Router()
const URL_CLIENT = process.env.URL_CLIENT

router.post('/login', authController.login)
router.post('/refresh-token', authController.refreshToken)
router.post('/logout', authController.logout)
router.post('/password/forgot', authController.forgotPassword_requestOtp)
router.post('/password/verify-otp', authController.forgotPassword_verifyOtp)
router.post('/password/reset', authController.forgotPassword_resetPassword)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: URL_CLIENT ? `${URL_CLIENT}/login` : '/login' }),
  googleCallback
)

export const routerAuth = router
