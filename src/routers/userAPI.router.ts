import { userController } from '@/controllers/user/user.controller'
import express from 'express'

const router = express.Router()

router.post('/register', userController.register)

export const routerUser = router
