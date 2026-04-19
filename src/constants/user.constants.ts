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

export enum EStatusGenderUser {
  FEMALE = 'female',
  MALE = 'male',
  OTHER = 'other'
}

export interface IUserConstants {
  email: string
  password: string
  fullName: string
  phone: string
  address: string
  birthday: string
  gender: EStatusGenderUser
  role: EStatusRoleUser
  status?: EStatusAccountUser
  backgroundAvatar?: string
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
  role?: EStatusRoleUser
  status?: EStatusAccountUser
  isVerified?: boolean

  keyword?: string
}

export interface IUserUpdateProfile {
  email?: string
  fullName?: string
  phone?: string
  address?: string
  birthday?: string
  gender?: EStatusGenderUser
  description?: string
  avatar?: string
  backgroundAvatar?: string
  role?: EStatusRoleUser
  isVerified?: boolean
}
