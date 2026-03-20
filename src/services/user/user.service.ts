import { IUserRegister } from '@/constants/user.constants'
import { User } from '@/models/user.model'

const registerUser = async (userData: IUserRegister) => {
  const existingUser = await User.findOne({ email: userData.email }).lean()
  if (existingUser) return false

  const seed = encodeURIComponent(userData.email || userData.fullName)
  const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`

  const newUser = new User({
    ...userData,
    avatar: avatarUrl
  })

  await newUser.save()

  return {
    email: newUser.email,
    fullName: newUser.fullName,
    phone: newUser.phone,
    birthday: newUser.birthday,
    gender: newUser.gender,
    address: newUser.address,
    role: newUser.role,
    avatar: newUser.avatar
  }
}

export const userService = {
  registerUser
}
