import { userController } from '@/controllers/user/user.controller'
import express from 'express'

const router = express.Router()

router.post('/register', userController.register)
router.get('/', userController.getAllUser)
router.get('/:id', userController.getUserById)
router.put('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)

export const routerUser = router
