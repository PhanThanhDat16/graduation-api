export const authValidation = (email: string, password: string) => {
  const errors: {
    email?: string
    password?: string
  } = {}

  if (!email || email.trim() === '') {
    errors.email = 'Email is required'
  }

  if (!password || password.trim() === '') {
    errors.password = 'Password is required'
  }
  return errors
}
