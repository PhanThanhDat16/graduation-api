import { aiController } from '@/controllers/ai/ai.controller'
import express from 'express'

const router = express.Router()

// AI data endpoints - no auth required (internal AI service calls)
router.get('/jobs', aiController.getJobs)
router.get('/jobs/:id', aiController.getJobById)
router.get('/freelancers', aiController.getFreelancers)
router.get('/freelancers/:id', aiController.getFreelancerById)

// AI chat message endpoints - for AI to fetch context and save responses
router.get('/groups/:groupId/messages', aiController.getMessages)
router.post('/groups/:groupId/messages', aiController.createMessage)

export const routerAI = router

