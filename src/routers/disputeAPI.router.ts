import { disputeController } from '@/controllers/dispute/dispute.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

// User routes
router.post('/', requireAuth, disputeController.createDispute)
router.get('/me', requireAuth, disputeController.getMyDisputes)
router.get('/contract/:contractId', requireAuth, disputeController.getDisputeByContractId)
router.get('/:id', requireAuth, disputeController.getDisputeById)
router.post('/:id/reason', requireAuth, disputeController.submitReason)
router.post('/:id/propose', requireAuth, disputeController.proposeResolution)
router.post('/:id/agree', requireAuth, disputeController.agreeToResolution)
router.post('/:id/escalate', requireAuth, disputeController.escalateToAdmin)

// Admin routes
router.get('/', requireAuth, disputeController.getAllDisputes)
router.post('/:id/admin/resolve', requireAuth, disputeController.adminResolveDispute)

export const routerDispute = router
