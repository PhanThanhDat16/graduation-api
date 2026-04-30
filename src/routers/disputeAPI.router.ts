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
router.post('/:id/escalate', requireAuth, disputeController.escalateDispute)
router.post('/:id/propose', requireAuth, disputeController.proposeResolution)
router.post('/:id/agree', requireAuth, disputeController.agreeToResolution)
router.get('/:id/check-deadline', requireAuth, disputeController.checkReasonDeadline)

// Staff routes
router.post('/:id/staff/join', requireAuth, disputeController.staffJoinDispute)
router.post('/:id/staff/cancel', requireAuth, disputeController.staffCancelDispute)
router.post('/:id/staff/resolve', requireAuth, disputeController.staffResolveDispute)

// Staff routes
router.get('/', requireAuth, disputeController.getAllDisputes)

export const routerDispute = router
