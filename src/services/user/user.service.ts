import { IUserRegister } from '@/constants/user.constants'
import { User } from '@/models/user.model'

const registerUser = async (userData: IUserRegister) => {

  const existingUser = await User.findOne({ email: userData.email }).lean()

  if (existingUser && existingUser.isVerified){
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
    newUser = await User.findOneAndUpdate(
      { email: userData.email },
      { ...userData, avatar: avatarUrl },
      { new: true },
    )
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

const getAllUser = async () => {
  return await User.find().select('-password')
}

const getUserById = async (id: string) => {
  return await User.findById(id).select('-password')
}

export const userService = {
  registerUser,
  getAllUser,
  getUserById
}
