/**
 * @openapi
 * tags:
 *   - name: PaymentMomo
 *     description: MoMo payment gateway endpoints — deposit via QR code
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CreatePaymentMomoRequest:
 *       type: object
 *       required:
 *         - amount
 *         - type
 *         - method
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 50000
 *           description: Amount to deposit (VND). Minimum 50,000 VND.
 *           example: 100000
 *         type:
 *           type: string
 *           enum: ["deposit"]
 *           description: Transaction type. Currently only "deposit" is supported for MoMo.
 *           example: "deposit"
 *         method:
 *           type: string
 *           enum: ["momo"]
 *           description: Payment method. Must be "momo" for this endpoint.
 *           example: "momo"
 *
 *     CreatePaymentMomoResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             orderId:
 *               type: string
 *               description: Unique transaction order ID
 *               example: "TRANS-1775225730486-2d7a323c"
 *             qrCodeUrl:
 *               type: string
 *               description: URL to MoMo QR code image for scanning
 *               example: "https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT1BBUk..."
 *             payUrl:
 *               type: string
 *               description: URL to redirect user to MoMo payment page
 *               example: "https://test-payment.momo.vn/pay/store/MOMOPARSER?t=TU9NT1BBUk..."
 *
 *     MoMoCallbackBody:
 *       type: object
 *       description: IPN callback body sent by MoMo server
 *       properties:
 *         partnerCode:
 *           type: string
 *           example: "MOMOPARSER"
 *         orderId:
 *           type: string
 *           example: "TRANS-1775225730486-2d7a323c"
 *         requestId:
 *           type: string
 *           example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *         amount:
 *           type: number
 *           example: 100000
 *         orderInfo:
 *           type: string
 *           example: "Payment for transaction TRANS-1775225730486-2d7a323c"
 *         orderType:
 *           type: string
 *           example: "momo_wallet"
 *         transId:
 *           type: number
 *           description: MoMo transaction ID
 *           example: 2745623489
 *         resultCode:
 *           type: number
 *           description: "0 = success, other = failure"
 *           example: 0
 *         message:
 *           type: string
 *           example: "Successful."
 *         payType:
 *           type: string
 *           example: "qr"
 *         responseTime:
 *           type: number
 *           example: 1775225735000
 *         extraData:
 *           type: string
 *           example: ""
 *         signature:
 *           type: string
 *           description: HMAC SHA256 signature for verification
 *           example: "abc123def456..."
 *
 *     MoMoCallbackResponse:
 *       type: object
 *       description: Always returns 200 with message OK to MoMo
 *       properties:
 *         message:
 *           type: string
 *           example: "OK"
 *
 *     HandleReturnMomoResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             orderId:
 *               type: string
 *               description: Transaction order ID
 *               example: "TRANS-1775225730486-2d7a323c"
 *             resultCode:
 *               type: string
 *               description: Result code from MoMo ("0" = success)
 *               example: "0"
 *             message:
 *               type: string
 *               description: Result message from MoMo
 *               example: "Successful."
 *
 *     GetTransactionStatusResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             payment_order_id:
 *               type: string
 *               description: Unique payment order ID
 *               example: "TRANS-1775225730486-2d7a323c"
 *             amount:
 *               type: number
 *               description: Transaction amount (VND)
 *               example: 100000
 *             status:
 *               type: string
 *               enum: ["pending", "completed", "failed", "cancelled"]
 *               description: Current transaction status
 *               example: "completed"
 *             payment_request_id:
 *               type: string
 *               description: MoMo request ID
 *               example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *             createdAt:
 *               type: string
 *               format: date-time
 *               example: "2026-04-03T10:00:00.000Z"
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: "2026-04-03T10:05:00.000Z"
 *
 *     PaymentMomoErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Invalid request: 'amount' is required and must be a number"
 */

// ─── Endpoint: Create Payment ────────────────────────────────────

/**
 * @openapi
 * /api/payment/momo/create:
 *   post:
 *     summary: Create a new MoMo QR payment
 *     description: Creates a wallet transaction (PENDING) and requests a MoMo QR code for the user to pay. Requires authentication.
 *     tags: [PaymentMomo]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreatePaymentMomoRequest"
 *     responses:
 *       200:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CreatePaymentMomoResponse"
 *       400:
 *         description: Invalid request (missing fields, amount too low, invalid type/method)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentMomoErrorResponse"
 *       401:
 *         description: Unauthorized — missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentMomoErrorResponse"
 *       500:
 *         description: Internal server error or MoMo API failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentMomoErrorResponse"
 */

// ─── Endpoint: MoMo IPN Callback ─────────────────────────────────

/**
 * @openapi
 * /api/payment/momo/callback:
 *   post:
 *     summary: Handle MoMo IPN callback
 *     description: |
 *       Receives IPN (Instant Payment Notification) from MoMo server.
 *       Verifies signature, updates transaction status, and updates wallet balance on success.
 *       Always returns HTTP 200 to MoMo regardless of processing result.
 *     tags: [PaymentMomo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/MoMoCallbackBody"
 *     responses:
 *       200:
 *         description: Callback acknowledged (always returns 200 to MoMo)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MoMoCallbackResponse"
 */

// ─── Endpoint: MoMo Return Redirect ──────────────────────────────

/**
 * @openapi
 * /api/payment/momo/return:
 *   get:
 *     summary: Handle MoMo redirect after payment
 *     description: MoMo redirects the user to this URL after payment completion. Returns the payment result as JSON.
 *     tags: [PaymentMomo]
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction order ID
 *         example: "TRANS-1775225730486-2d7a323c"
 *       - in: query
 *         name: resultCode
 *         schema:
 *           type: string
 *         required: true
 *         description: MoMo result code ("0" = success)
 *         example: "0"
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *         required: true
 *         description: MoMo result message
 *         example: "Successful."
 *     responses:
 *       200:
 *         description: Payment result returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HandleReturnMomoResponse"
 */

// ─── Endpoint: Get Transaction Status ────────────────────────────

/**
 * @openapi
 * /api/payment/momo/{orderId}:
 *   get:
 *     summary: Get transaction status by order ID
 *     description: Retrieves the current status of a wallet transaction by its payment_order_id.
 *     tags: [PaymentMomo]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction order ID (payment_order_id)
 *         example: "TRANS-1775225730486-2d7a323c"
 *     responses:
 *       200:
 *         description: Transaction status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/GetTransactionStatusResponse"
 *       400:
 *         description: Order ID missing or transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentMomoErrorResponse"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentMomoErrorResponse"
 */
