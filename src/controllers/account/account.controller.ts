import expressAsyncHandler from 'express-async-handler'
import { RequestWithUser } from '@/middlewares/auth.middlewares'
import { accountService } from '@/services/account/account.service'
import { HttpStatus } from '@/constants/http.constants'
import { Response } from 'express'
import { EAccountStatus, IAccountConstants } from '@/constants/account.constants'

const createBankAccount = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
    const {code, bankShortName, accountNumber, accountName, logo, status } = req.body
    const userId = req.user?._id
    
    if (!userId) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'User ID is required'
        })
        return
    }
    
    if(!bankShortName || !accountNumber || !accountName || !status) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'All fields are required'
        })
        return
    }
    const Account: IAccountConstants = {
        userId,
        bankShortName,
        accountNumber,
        accountName,
        status,
        code,
        logo
    }

    const newAccount = await accountService.createBankAccount(Account)

    if(!newAccount) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Create bank account failed'
        })
        return
    }

    res.status(HttpStatus.OK).json({
        message: 'Create bank account successfully',
        data: newAccount
    })
})

const getAllBankAccountsByUserId = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
    const userId = req.user?._id
    
    if (!userId) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'User ID is required'
        })
        return
    }
    
    const accounts = await accountService.getAllBankAccountsByUserId(userId)
    
    if(!accounts) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Get bank accounts failed'
        })
        return
    }
    
    res.status(HttpStatus.OK).json({
        message: 'Get bank accounts successfully',
        data: accounts
    })
})

const getBankAccountById = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params
    const userId = req.user?._id
    
    if (!id) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'ID account is required'
        })
        return
    }
    
    const account = await accountService.getBankAccountById(id as string)
    
    if(!account) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Get bank account failed'
        })
        return
    }
    
    res.status(HttpStatus.OK).json({
        message: 'Get bank account successfully',
        data: account
    })
})

const updateBankAccountById = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params
    const userId = req.user?._id
    const {accountNumber, accountName } = req.body
    
    if (!id) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'ID account is required'
        })
        return
    }
    
    const existsAccount = await accountService.getBankAccountById(id as string)

    if(!existsAccount) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Account not found'
        })
        return
    }

    if(existsAccount.userId !== userId) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'You are not authorized to update this account'
        })
        return
    }
    
    const account = await accountService.updateBankAccountById(id as string, userId as string, {accountNumber, accountName })
    
    if(!account) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Update bank account failed'
        })
        return
    }
    
    res.status(HttpStatus.OK).json({
        message: 'Update bank account successfully',
        data: account
    })
})

const updateStatusBankAccountById = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params
    const userId = req.user?._id
    const {status } = req.body
    
    if (!id) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'ID account is required'
        })
        return
    }
    const existsAccount = await accountService.getBankAccountById(id as string)

    if(!existsAccount) {

        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Account not found'
        })
        return
    }

    if(existsAccount.userId.toString() !== userId.toString()) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'You are not authorized to update this account'
        })
        return
    }
    
    const account = await accountService.updateStatusBankAccountById(id as string, userId as string, status as EAccountStatus)
    
    if(!account) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Update bank account failed'
        })
        return
    }
    
    res.status(HttpStatus.OK).json({
        message: 'Update bank account successfully',
        data: account
    })
})

const deleteBankAccountById = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
    const { id } = req.params
    const userId = req.user?._id
    
    if (!id) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'ID account is required'
        })
        return
    }
    
    const account = await accountService.deleteBankAccountById(id as string, userId as string)
    
    if(!account) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: 'Delete bank account failed'
        })
        return
    }
    
    res.status(HttpStatus.OK).json({
        status: "success",
        message: 'Delete bank account successfully',
    })
})

export const accountController = {
    createBankAccount,
    getAllBankAccountsByUserId,
    getBankAccountById,
    updateBankAccountById,
    updateStatusBankAccountById,
    deleteBankAccountById
}

