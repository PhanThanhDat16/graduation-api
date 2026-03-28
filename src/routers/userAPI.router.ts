import { userController } from '@/controllers/user/user.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

router.post('/register', userController.register)
router.get('/', userController.getAllUser)
router.get('/profile', requireAuth, userController.getProfile)
router.put('/profile', requireAuth, userController.updateProfile)
router.post('/email/request-otp', requireAuth, userController.requestEmailChangeOtp)
router.put('/password', requireAuth, userController.updatePassword)
router.put('/email', requireAuth, userController.updateEmail)
router.delete('/:id', userController.deleteUser)

// admin update
router.get('/:id', userController.getUserById)
router.put('/:id', userController.updateUser)

export const routerUser = router
