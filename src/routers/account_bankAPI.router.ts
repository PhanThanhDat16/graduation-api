import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'
import { accountBankController } from '@/controllers/account/account_bank.controller'

const router = express.Router()

router.post('/', requireAuth, accountBankController.createBankAccount)
router.get('/my-accounts', requireAuth, accountBankController.getAllBankAccountsByUserId)
router.get('/:id', requireAuth, accountBankController.getBankAccountById)
router.put('/:id', requireAuth, accountBankController.updateBankAccountById)
router.patch('/status/:id', requireAuth, accountBankController.updateStatusBankAccountById)
router.delete('/:id', requireAuth, accountBankController.deleteBankAccountById)

export const routerAccountBank = router
