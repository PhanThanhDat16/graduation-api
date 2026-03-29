import { postController } from '@/controllers/post/post.controller'
import express from 'express'
import { requireAuth } from '@/middlewares/auth.middlewares'
const router = express.Router()

router.post('/', requireAuth, postController.createPost)
router.get('/', postController.getAllPost)
router.get('/author', requireAuth, postController.getPostByAuthorId)
router.get('/:id', postController.getPostById)
router.put('/like/:id', requireAuth, postController.likePost)
router.put('/:id', requireAuth, postController.updatePost)
router.delete('/:id', requireAuth, postController.deletePost)

export const routerPost = router
