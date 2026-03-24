import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.AUTH_EMAIL!,
    pass: process.env.AUTH_PASS!
  },
  connectionTimeout: 5000,
  greetingTimeout: 3000,
  socketTimeout: 5000
})

export default transporter
