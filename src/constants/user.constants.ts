export enum EStatusRoleUser {
  FREELANCER = 'freelancer',
  CONTRACTOR = 'contractor',
  STAFF = 'staff',
  ADMIN = 'admin',
  OTHER = 'other'
}

export enum EStatusAccountUser {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned'
}

export interface IUserConstants {
  email: string
  password: string
  fullName: string
  phone: string
  address: string
  birthday: string
  gender: 'female' | 'male' | 'other'
  role: EStatusRoleUser
  status?: EStatusAccountUser
  citizenIdNumber?: string
  ratingAvgNumber?: number
  ratingCountNumber?: number
  contractFavourite?: string[]
  provider?: string
  googleId?: string
  isVerified?: boolean
}

export interface IUserRegister extends IUserConstants {
  avatar?: string
}

export interface UserFilter {
  role?: 'freelancer' | 'contractor' | 'staff' | 'admin' | 'other'
  status?: 'active' | 'inactive' | 'banned'
  isVerified?: boolean

  keyword?: string
}

export interface IUserUpdateProfile {
  email?: string
  fullName?: string
  phone?: string
  address?: string
  birthday?: string
  gender?: 'female' | 'male' | 'other'
  description?: string
  avatar?: string
  role?: EStatusRoleUser
  isVerified?: boolean
}
