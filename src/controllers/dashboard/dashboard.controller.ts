import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { dashboardService } from '@/services/dashboard/dashboard.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'

/**
 * GET /api/dashboard?from=ISO&to=ISO&granularity=day|month|year
 */
const getDashboard = expressAsyncHandler(async (req: Request, res: Response) => {
  const { from, to, granularity } = req.query

  if (!from || !to) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: '"from" and "to" query params are required (ISO date)' })
    return
  }

  const g = (['day', 'month', 'year'].includes(granularity as string) ? granularity : 'month') as
    | 'day'
    | 'month'
    | 'year'

  const fromDate = new Date(from as string)
  const toDate = new Date(to as string)

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid date format for "from" or "to"' })
    return
  }

  const result = await dashboardService.getDashboard(fromDate, toDate, g)

  res.status(HttpStatus.OK).json({
    message: 'Dashboard data fetched successfully',
    data: result
  })
})

/**
 * GET /api/dashboard/personal
 * Get personal dashboard data for the authenticated user
 */
const getPersonalDashboard = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id

  if (!userId) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Unauthorized'
    })
    return
  }

  const result = await dashboardService.getPersonalDashboard(userId as string)

  res.status(HttpStatus.OK).json({
    message: 'Personal dashboard data fetched successfully',
    data: result
  })
})

export const dashboardController = {
  getDashboard,
  getPersonalDashboard
}
