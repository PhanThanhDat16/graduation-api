import { contractController } from '@/controllers/contract/contract.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

// User routes
router.post('/', requireAuth, contractController.createContract)
router.get('/me', requireAuth, contractController.getMyContracts)
router.get('/:id', requireAuth, contractController.getContractById)
router.put('/:id', requireAuth, contractController.updateContract)
router.post('/:id/agree', requireAuth, contractController.agreeToContract)
router.post('/:id/pay', requireAuth, contractController.payForContract)
router.post('/:id/submit', requireAuth, contractController.submitContract)
router.post('/:id/complete', requireAuth, contractController.completeContract)
router.post('/:id/cancel', requireAuth, contractController.cancelContract)
router.post('/:id/extend', requireAuth, contractController.extendDeadline)
router.get('/:id/payments', requireAuth, contractController.getContractPayments)

// Admin routes
router.get('/', requireAuth, contractController.getAllContracts)

export const routerContract = router
