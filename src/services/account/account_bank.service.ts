import AccountBank from '@/models/account_bank.model'
import { EAccountStatus, IAccountConstants, IAccountUpdate } from '@/constants/account_bank.constants'
import mongoose from 'mongoose'

const createBankAccount = async (data: IAccountConstants) => {
  const account = await AccountBank.findOne({ userId: data.userId, bankShortName: data.bankShortName })

  if (account) {
    throw Error('Account already exists')
  }

  const newAccount = await AccountBank.create(data)

  return newAccount
}

const getAllBankAccountsByUserId = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw Error('Invalid user id')
  }

  return await AccountBank.find({ userId }).sort({ createdAt: -1 })
}

const getBankAccountById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw Error('Invalid account id')
  }
  return await AccountBank.findById(id)
}

const updateBankAccountById = async (id: string, userId: string, data: IAccountUpdate) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw Error('Invalid account id')
  }
  return await AccountBank.findOneAndUpdate({ _id: id, userId }, data, { new: true })
}

const deleteBankAccountById = async (id: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw Error('Invalid account id')
  }
  return await AccountBank.findOneAndDelete({ _id: id, userId })
}

const updateStatusBankAccountById = async (id: string, userId: string, status: EAccountStatus) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw Error('Invalid account id')
  }
  return await AccountBank.findOneAndUpdate({ _id: id, userId }, { status }, { new: true })
}

export const accountBankService = {
  createBankAccount,
  getAllBankAccountsByUserId,
  getBankAccountById,
  updateBankAccountById,
  deleteBankAccountById,
  updateStatusBankAccountById
}
