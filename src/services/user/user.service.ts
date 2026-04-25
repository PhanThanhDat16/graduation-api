import { IUserRegister, IUserUpdateProfile, UserFilter } from '@/constants/user.constants'
import { User } from '@/models/user.model'
import mongoose from 'mongoose'
import { paginate } from '@/utils/paginate'
import { PaginationQuery } from '@/constants/pagination.constant'

const USER_SAFE_FIELDS = `
  _id avatar email phone fullName role status
  ratingAvg ratingCount isVerified createdAt
  birthday gender address description
`

const registerUser = async (userData: IUserRegister) => {
  const existingUser = await User.findOne({ email: userData.email }).lean()

  if (existingUser && existingUser.isVerified) {
    return false
  }

  const seed = encodeURIComponent(userData.email || userData.fullName)
  const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`

  let newUser

  if (!existingUser) {
    newUser = await User.create({
      ...userData,
      avatar: avatarUrl
    })
  } else if (!existingUser.isVerified) {
    newUser = await User.findOneAndUpdate({ email: userData.email }, { ...userData, avatar: avatarUrl }, { new: true })
  }

  return {
    email: newUser?.email || '',
    fullName: newUser?.fullName || '',
    phone: newUser?.phone || '',
    birthday: newUser?.birthday || '',
    gender: newUser?.gender || '',
    address: newUser?.address || '',
    role: newUser?.role || '',
    avatar: newUser?.avatar || '',
    isVerified: newUser?.isVerified || false
  }
}

const createStaffUser = async (userData: IUserRegister) => {
  const existingUser = await User.findOne({ email: userData.email }).lean()

  if (existingUser && existingUser.isVerified) {
    return false
  }

  const seed = encodeURIComponent(userData.email || userData.fullName)
  const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`

  let newUser

  if (!existingUser) {
    newUser = await User.create({
      ...userData,
      avatar: avatarUrl,
      isVerified: true
    })
  } else if (!existingUser.isVerified) {
    newUser = await User.findOneAndUpdate({ email: userData.email }, { ...userData, avatar: avatarUrl }, { new: true })
  }

  return {
    email: newUser?.email || '',
    fullName: newUser?.fullName || '',
    phone: newUser?.phone || '',
    birthday: newUser?.birthday || '',
    gender: newUser?.gender || '',
    address: newUser?.address || '',
    role: newUser?.role || '',
    avatar: newUser?.avatar || '',
    isVerified: newUser?.isVerified || true
  }
}

const getAllUser = async (query: PaginationQuery & UserFilter) => {
  const filter: any = {}

  if (query.role) {
    filter.role = query.role
  }

  if (query.status) {
    filter.status = query.status
  }

  if (query.isVerified !== undefined) {
    filter.isVerified = query.isVerified
  }

  if (query.keyword) {
    filter.$or = [
      { fullName: { $regex: query.keyword, $options: 'i' } },
      { email: { $regex: query.keyword, $options: 'i' } }
    ]
  }

  return await paginate(User, filter, query, USER_SAFE_FIELDS)
}

const getUserById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid user ID format')
  }

  const user = await User.findById(id).select(USER_SAFE_FIELDS).lean()

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

const updateUser = async (userId: string, userData: IUserUpdateProfile) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID')
  }

  const user = await User.findByIdAndUpdate(userId, userData, { new: true }).select(USER_SAFE_FIELDS).lean()

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

const deleteUser = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID')
  }

  const user = await User.deleteOne({ _id: userId })

  if (!user) {
    throw new Error('User not found')
  }

  return { message: 'User deleted successfully' }
}

const getProfile = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const user = await User.findById(userId).select(USER_SAFE_FIELDS).lean()

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

const updateProfile = async (userId: string, profileData: IUserUpdateProfile) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID')
  }

  const user = await User.findByIdAndUpdate(userId, profileData, { new: true }).select(USER_SAFE_FIELDS).lean()

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

const updatePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID')
  }

  const user = await User.findById(userId).select('+password')

  if (!user) {
    throw new Error('User not found')
  }

  const isMatch = await import('bcrypt').then((bcrypt) => bcrypt.compare(currentPassword, user.password || ''))

  if (!isMatch) {
    throw new Error('Current password is incorrect')
  }

  const hashedPassword = await import('bcrypt').then((bcrypt) => bcrypt.hash(newPassword, 10))

  user.password = hashedPassword
  await user.save()

  return { message: 'Password updated successfully' }
}

const updateEmail = async (userId: string, newEmail: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID')
  }

  const existingUser = await User.findOne({ email: newEmail, _id: { $ne: userId } })

  if (existingUser) {
    throw new Error('Email already in use')
  }

  const user = await User.findByIdAndUpdate(userId, { email: newEmail, isVerified: false }, { new: true })
    .select(USER_SAFE_FIELDS)
    .lean()

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

export const userService = {
  registerUser,
  getAllUser,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  updatePassword,
  updateEmail,
  createStaffUser
}
