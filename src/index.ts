import express, { NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import http from 'http'
import cookieParser from 'cookie-parser'
import connectMongoDB from './config/mongodb'
import { HttpStatus } from './constants/http.constants'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'

// Auth Google
import passport from 'passport'
import initPassport from './config/passport.config'

import { routerAuth } from '@/routers/authAPI.router'
import { routerUser } from './routers/userAPI.router'
import { emailOtpRouter } from './routers/email_otpsAPI.router'
import { routerWallet } from './routers/walletAPI.router'
import { routerContract } from './routers/contractAPI.router'
import { routerDispute } from './routers/disputeAPI.router'
import { routerPost } from './routers/postAPI.router'
import { PaymentMomoRouter } from './routers/payment-momo.router'
import { routerReview } from './routers/reviewAPI.router'
import { routerAdminHistory } from './routers/admin_historyAPI.router'
import { routerNotification } from './routers/notificationAPI.router'

dotenv.config()

connectMongoDB()

const app = express()
const server = http.createServer(app)

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)
app.use(morgan('common'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Config swagger
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Graduation API',
      version: '1.0.0'
    },
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`
      }
    ]
  },
  apis: ['./src/routers/*.ts', './src/swagger/*.ts']
})

app.get('/docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json')
  res.status(HttpStatus.OK).send(swaggerSpec)
})
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routers
app.use('/api/auth', routerAuth)
app.use('/api/email', emailOtpRouter)
app.use('/api/users', routerUser)
app.use('/api/wallets', routerWallet)
app.use('/api/contracts', routerContract)
app.use('/api/disputes', routerDispute)
app.use('/api/posts', routerPost)
app.use('/api/payment', PaymentMomoRouter)
app.use('/api/reviews', routerReview)
app.use('/api/admin-histories', routerAdminHistory)
app.use('/api/notifications', routerNotification)

// Initialize Auth Google
app.use(passport.initialize())
initPassport(passport)

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: err.message || 'Internal Server Error'
  })
})

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})
