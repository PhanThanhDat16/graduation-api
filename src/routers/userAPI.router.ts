import { userController } from '@/controllers/user/user.controller'
import express from 'express'

const router = express.Router()

router.post('/register', userController.register)
router.get('/get-all-user', userController.getAllUser)
router.get('/get-user-by-id/:id', userController.getUserById)

export const routerUser = router
