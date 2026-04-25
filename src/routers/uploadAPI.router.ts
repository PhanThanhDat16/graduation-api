import express from 'express'
import { upload } from '@/middlewares/upload.middlewares'
import { uploadController } from '@/controllers/upload/upload.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'

const router = express.Router()

router.post('/avatar', requireAuth, upload.single('avatar'), uploadController.uploadImage)

router.post('/image', requireAuth, upload.single('image'), uploadController.uploadImage)

router.post('/images', upload.array('images', 3), uploadController.uploadImages)
export const routerUpload = router
