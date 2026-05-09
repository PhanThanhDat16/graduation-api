import express from 'express'
import { requireAuth } from '@/middlewares/auth.middlewares'
import { dashboardController } from '@/controllers/dashboard/dashboard.controller'

const router = express.Router()

router.get('/', requireAuth, dashboardController.getDashboard)

export const routerDashboard = router
