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

// Staff routes (withdraw management + user wallet operations)
router.get('/staff/withdraw-requests', requireAuth, walletController.getAllWithdrawRequests)
router.put('/staff/withdraw-requests/:id', requireAuth, walletController.processWithdrawRequest)
router.get('/staff/users/:userId', requireAuth, walletController.getUserWallet)
router.post('/staff/users/:userId/deposit', requireAuth, walletController.adminDeposit)

// Admin routes (wallet overview)
router.get('/admin/wallets', requireAuth, walletController.getAllWallets)
router.get('/admin/wallets/:userId', requireAuth, walletController.getUserWallet)

export const routerWallet = router
