import { applicationController } from '@/controllers/application/application.controller'
import express from 'express'
import { requireAuth } from '@/middlewares/auth.middlewares'
const router = express.Router()

router.post('/', requireAuth, applicationController.createApplication)
router.get('/', applicationController.getAllApplication)
router.get('/my', requireAuth, applicationController.getMyApplications)
router.get('/project/:projectId', applicationController.getApplicationsByProjectId)
router.get('/:id', applicationController.getApplicationById)
router.put('/:id', requireAuth, applicationController.updateApplication)
router.put('/:id/status', requireAuth, applicationController.updateApplicationStatus)
router.delete('/:id', requireAuth, applicationController.deleteApplication)

export const routerApplication = router
