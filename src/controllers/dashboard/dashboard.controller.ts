import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { dashboardService } from '@/services/dashboard/dashboard.service'

/**
 * GET /api/dashboard?from=ISO&to=ISO&granularity=day|month|year
 */
const getDashboard = expressAsyncHandler(async (req: Request, res: Response) => {
  const { from, to, granularity } = req.query

  if (!from || !to) {
    res.status(HttpStatus.BAD_REQUEST).json({ message: '"from" and "to" query params are required (ISO date)' })
    return
  }

  const g = (['day', 'month', 'year'].includes(granularity as string) ? granularity : 'month') as 'day' | 'month' | 'year'

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

export const dashboardController = {
  getDashboard
}
