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
  googleId?: string,
  isVerified?: boolean
}

export interface IUserRegister extends IUserConstants {
  avatar?: string
}
