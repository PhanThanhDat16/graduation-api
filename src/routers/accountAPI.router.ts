import {requireAuth} from "@/middlewares/auth.middlewares";
import express  from "express";
import { accountController } from "@/controllers/account/account.controller";

const router = express.Router();

router.post('/', requireAuth, accountController.createBankAccount);
router.get('/my-accounts', requireAuth, accountController.getAllBankAccountsByUserId);
router.get('/:id', requireAuth, accountController.getBankAccountById);
router.put('/:id', requireAuth, accountController.updateBankAccountById);
router.patch('/status/:id', requireAuth, accountController.updateStatusBankAccountById);
router.delete('/:id', requireAuth, accountController.deleteBankAccountById);

export const routerAccount = router;
