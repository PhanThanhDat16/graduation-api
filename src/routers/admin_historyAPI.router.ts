import { adminHistoryController } from '@/controllers/admin_history/admin_history.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

// not authentication
router.get('/', adminHistoryController.getAllAdminHistories)
router.get('/contract/:contractId', adminHistoryController.getHistoriesByContractId)
router.get('/dispute/:disputeId', adminHistoryController.getHistoriesByDisputeId)
router.get('/user/:userId', adminHistoryController.getHistoriesByUserId)
router.get('/:id', adminHistoryController.getAdminHistoryById)

// authentication
router.get('/me', requireAuth, adminHistoryController.getHistoriesByAdminId)
router.post('/', requireAuth, adminHistoryController.createAdminHistory)
router.put('/:id', requireAuth, adminHistoryController.updateAdminHistory)
router.delete('/:id', requireAuth, adminHistoryController.deleteAdminHistory)

export const routerAdminHistory = router
