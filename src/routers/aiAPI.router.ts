import { aiController } from '@/controllers/ai/ai.controller'
import express from 'express'

const router = express.Router()

// AI data endpoints - no auth required (internal AI service calls)
router.get('/jobs', aiController.getJobs)
router.get('/jobs/:id', aiController.getJobById)
router.get('/freelancers', aiController.getFreelancers)
router.get('/freelancers/:id', aiController.getFreelancerById)

export const routerAI = router
