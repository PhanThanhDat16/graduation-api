import { projectController } from '@/controllers/project/project.controller'
import express from 'express'
import { requireAuth } from '@/middlewares/auth.middlewares'
const router = express.Router()

router.post('/', requireAuth, projectController.createProject)
router.get('/', projectController.getAllProject)
router.get('/contractor', requireAuth, projectController.getProjectByContractorId)
router.get('/:id', projectController.getProjectById)
router.put('/like/:id', requireAuth, projectController.likeProject)
router.put('/:id', requireAuth, projectController.updateProject)
router.delete('/:id', requireAuth, projectController.deleteProject)

export const routerProject = router
