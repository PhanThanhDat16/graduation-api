import express from 'express'
import { authController } from '@/controllers/auth/auth.controller'

const router = express.Router()

router.post('/login', authController.login)
router.post('/refresh-token', authController.refreshToken)
router.post('/logout', authController.logout)

export const routerAuth = router
