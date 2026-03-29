import { walletController } from '@/controllers/wallet/wallet.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

// User routes
router.get('/balance', requireAuth, walletController.getMyBalance)
router.get('/me', requireAuth, walletController.getMyWallet)
router.post('/deposit', requireAuth, walletController.deposit)
router.get('/transactions', requireAuth, walletController.getMyTransactions)

// Withdraw request routes (user)
router.post('/withdraw-requests', requireAuth, walletController.createWithdrawRequest)
router.get('/withdraw-requests', requireAuth, walletController.getMyWithdrawRequests)
router.delete('/withdraw-requests/:id', requireAuth, walletController.cancelWithdrawRequest)

// Admin routes
router.get('/admin/withdraw-requests', requireAuth, walletController.getAllWithdrawRequests)
router.put('/admin/withdraw-requests/:id', requireAuth, walletController.processWithdrawRequest)
router.get('/admin/users/:userId', requireAuth, walletController.getUserWallet)
router.post('/admin/users/:userId/deposit', requireAuth, walletController.adminDeposit)

export const routerWallet = router
