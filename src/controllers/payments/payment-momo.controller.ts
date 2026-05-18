import { Request, Response, NextFunction } from 'express'
import { paymentService } from '@/services/payments/payment-momo.service'
import logger from '@/utils/logger'
import { MoMoCallbackBody } from '@/constants/payment-momo.constants'
import expressAsyncHandler from 'express-async-handler'
import { RequestWithUser } from '@/middlewares/auth.middlewares'
import { HttpStatus } from '@/constants/http.constants'
import { EPaymentMethod, ETransactionType } from '@/constants/wallet.constants'

/**
 * Payment Controller — handles HTTP request/response logic.
 * Business logic is delegated to PaymentService.
 */
export const paymentController = {
  // create payment momo
  createPayment: expressAsyncHandler(async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { amount, type, method, description } = req.body
      const userId = req.user?._id

      // Validate input
      if (!userId) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Unauthorized'
        })
        return
      }

      if (!amount || typeof amount !== 'number') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid request: 'amount' is required and must be a number"
        })
        return
      }

      if (!type || type !== ETransactionType.DEPOSIT) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid request: 'type' is required"
        })
        return
      }

      if (!method || method !== EPaymentMethod.MOMO) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid request: 'method' is required"
        })
        return
      }

      if (amount < 100000) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Amount must be at least 100,000 VND'
        })
        return
      }

      const result = await paymentService.createPayment(
        userId,
        amount,
        type as ETransactionType,
        method as EPaymentMethod,
        description as string
      )

      res.status(HttpStatus.OK).json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }),

  /**
   * Handle MoMo IPN callback.
   * MUST always return HTTP 200 to MoMo regardless of processing result.
   */
  handleCallback: expressAsyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const callbackBody = req.body as MoMoCallbackBody

    try {
      logger.info('IPN Callback received', { orderId: callbackBody.orderId })

      await paymentService.handleCallback(callbackBody)

      // Always return 200 to MoMo
      res.status(HttpStatus.OK).json({ message: 'OK' })
    } catch (error: any) {
      const logicErrors = ['Invalid signature', 'Amount mismatch', 'Transaction not found']
      const isLogicError = logicErrors.some((msg) => error.message?.includes(msg))

      logger.error('Callback Error', {
        orderId: callbackBody.orderId,
        message: error.message
      })

      if (isLogicError) {
        // Trả về 200 để MoMo không retry nữa (vì retry cũng sẽ vẫn lỗi logic đó)
        res.status(HttpStatus.OK).json({ message: 'Error acknowledged' })
      } else {
        // Trả về 500 để MoMo RETRY lại (ví dụ lỗi DB tạm thời)
        // Khi DB sống lại, IPN gửi lại sẽ giúp khách được cộng tiền tự động
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server busy' })
      }
    }
  }),

  /**
   * Handle MoMo redirect after payment.
   * Redirects user to a frontend result page with order details.
   */
  handleReturn: expressAsyncHandler(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { orderId, resultCode, message } = req.query

    const order = await paymentService.getOrderStatus(orderId as string)

    res.redirect(
      `http://localhost:3000/payment-result?orderId=${orderId}&resultCode=${resultCode}&message=${message}&amount=${order.amount}&methodPayment=${EPaymentMethod.MOMO}&authorPayment=${order.fullName}&email=${order.email}`
    )
  }),

  /**
   * GET /api/payment/:orderId
   * Get order status.
   */
  getOrderStatus: expressAsyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderId } = req.params

      if (!orderId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Order ID is required'
        })
        return
      }

      const order = await paymentService.getOrderStatus(orderId as string)

      res.status(HttpStatus.OK).json({
        success: true,
        data: order
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: error.message
        })
        return
      }
      next(error)
    }
  })
}
