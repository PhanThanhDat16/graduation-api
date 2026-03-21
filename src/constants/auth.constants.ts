export interface IAuthConstants {
  id: string
  email: string
  fullName: string
  phone?: string
  avatar?: string
  birthday?: Date
  gender?: 'female' | 'male' | 'other'
  citizenIdNumber?: string
  description?: string
  address?: string
  role?: 'freelancer' | 'contractor' | 'staff' | 'admin' | 'other'
}
