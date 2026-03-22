import { PassportStatic } from 'passport'
import { Strategy as GoogleStrategy, Profile, StrategyOptionsWithRequest } from 'passport-google-oauth20'
import type { Request } from 'express'
import { User } from '@/models/user.model'
import dotenv from 'dotenv'
dotenv.config()

const { CLIENT_ID, CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env

if (!CLIENT_ID || !CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  throw new Error('Missing Google OAuth environment variables in .env')
}

function initPassport(passport: PassportStatic) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: CLIENT_ID!,
        clientSecret: CLIENT_SECRET!,
        callbackURL: GOOGLE_CALLBACK_URL!,
        passReqToCallback: true
      } as StrategyOptionsWithRequest,
      async (_req: Request, _accessToken: string, _refreshToken: string, profile: Profile, done) => {
        try {
          const email = profile.emails?.[0]?.value
          if (!email) {
            return done(new Error('No email found in Google profile'), undefined)
          }

          const seed = encodeURIComponent(email || profile.displayName)
          const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`

          const existingUser = await User.findOne({ email })
          if (existingUser) {
            existingUser.provider = 'google'
            existingUser.googleId = profile.id
            if (!existingUser.avatar) existingUser.avatar = avatarUrl
            if (!existingUser.fullName) existingUser.fullName = profile.displayName || email
            await existingUser.save()
            return done(null, existingUser)
          }

          const newUser = await User.create({
            fullName: profile.displayName || email,
            email,
            password: '',
            avatar: avatarUrl,
            provider: 'google',
            googleId: profile.id
          })

          return done(null, newUser)
        } catch (error) {
          return done(error, undefined)
        }
      }
    )
  )

  passport.serializeUser((user: unknown, done) => {
    done(null, (user as { id: string }).id)
  })

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id).exec()
      done(null, user)
    } catch (error) {
      done(error, null)
    }
  })
}

export default initPassport
