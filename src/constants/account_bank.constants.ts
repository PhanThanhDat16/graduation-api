export const ACCOUNT_MESSAGES = {
  NOT_FOUND: 'Account not found',
  CREATE_SUCCESS: 'Account created successfully',
  UPDATE_SUCCESS: 'Account updated successfully',
  DELETE_SUCCESS: 'Account deleted successfully',
  STATUS_UPDATE_SUCCESS: 'Account status updated successfully'
}

export enum EAccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface IAccountConstants {
  userId: string
  code: string
  bankShortName: string
  accountNumber: string
  accountName: string
  logo: string
  status: EAccountStatus
}

export interface IAccountUpdate {
  accountNumber?: string
  accountName?: string
}
