/**
 * @openapi
 * tags:
 *   - name: PaymentVnpay
 *     description: VNPay payment gateway endpoints — deposit, IPN, query & refund
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CreatePaymentVnpayRequest:
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
 *           description: Transaction type. Currently only "deposit" is supported.
 *           example: "deposit"
 *         method:
 *           type: string
 *           enum: ["vnpay"]
 *           description: Payment method. Must be "vnpay" for this endpoint.
 *           example: "vnpay"
 *
 *     CreatePaymentVnpayResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: "00"
 *         message:
 *           type: string
 *           example: "Success"
 *         data:
 *           type: object
 *           properties:
 *             paymentUrl:
 *               type: string
 *               description: URL to redirect user to VNPay payment page
 *               example: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=10000000&..."
 *             vnp_TxnRef:
 *               type: string
 *               description: Unique transaction reference (payment_order_id)
 *               example: "TRANS-1775225730486-2d7a323c"
 *             amount:
 *               type: number
 *               description: Payment amount (VND)
 *               example: 100000
 *             orderInfo:
 *               type: string
 *               description: Order description
 *               example: "Payment for transaction TRANS-1775225730486-2d7a323c"
 *
 *     HandleReturnVnpayResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: VNPay response code ("00" = success)
 *           example: "00"
 *         status:
 *           type: string
 *           enum: ["Success", "Failed"]
 *           example: "Success"
 *         message:
 *           type: string
 *           example: "Giao dịch thành công"
 *         data:
 *           type: object
 *           properties:
 *             orderId:
 *               type: string
 *               example: "TRANS-1775225730486-2d7a323c"
 *             amount:
 *               type: string
 *               description: Formatted amount (VND)
 *               example: "100.000"
 *             bankCode:
 *               type: string
 *               description: Bank code used for payment
 *               example: "NCB"
 *             transactionNo:
 *               type: string
 *               description: VNPay transaction number
 *               example: "14422858"
 *             payDate:
 *               type: string
 *               description: Formatted payment date
 *               example: "2026-04-08 15:30:00"
 *             transaction:
 *               type: object
 *               description: Full wallet transaction document
 *
 *     VnpayIpnResponse:
 *       type: object
 *       description: IPN response — always returns 200 to VNPay
 *       properties:
 *         RspCode:
 *           type: string
 *           description: "00 = success, 01 = order not found, 02 = already confirmed, 04 = invalid amount, 97 = invalid signature, 99 = error"
 *           example: "00"
 *         Message:
 *           type: string
 *           example: "Confirm Success"
 *
 *     QueryTransactionVnpayResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: "00"
 *         message:
 *           type: string
 *           example: "Success"
 *         data:
 *           type: object
 *           properties:
 *             payment_order_id:
 *               type: string
 *               example: "TRANS-1775225730486-2d7a323c"
 *             amount:
 *               type: number
 *               example: 100000
 *             status:
 *               type: string
 *               enum: ["pending", "completed", "failed", "cancelled"]
 *               example: "completed"
 *             vnp_ResponseCode:
 *               type: string
 *               example: "00"
 *             vnp_TransactionNo:
 *               type: string
 *               example: "14422858"
 *             vnp_PayDate:
 *               type: string
 *               example: "2026-04-08 15:30:00"
 *             createdAt:
 *               type: string
 *               format: date-time
 *               example: "2026-04-08T08:30:00.000Z"
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: "2026-04-08T08:35:00.000Z"
 *
 *     RefundVnpayRequest:
 *       type: object
 *       required:
 *         - orderId
 *         - amount
 *         - transactionDate
 *         - transactionNo
 *       properties:
 *         orderId:
 *           type: string
 *           description: Payment order ID to refund
 *           example: "TRANS-1775225730486-2d7a323c"
 *         amount:
 *           type: number
 *           description: Amount to refund (VND)
 *           example: 100000
 *         transactionDate:
 *           type: string
 *           description: Original transaction date from VNPay
 *           example: "20260408153000"
 *         transactionNo:
 *           type: string
 *           description: VNPay transaction number
 *           example: "14422858"
 *         user:
 *           type: string
 *           description: User who initiates the refund (defaults to "admin")
 *           example: "admin"
 *
 *     RefundVnpayResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: VNPay refund response code
 *           example: "00"
 *         message:
 *           type: string
 *           example: "Success"
 *         data:
 *           type: object
 *           description: Full response from VNPay refund API
 *
 *     PaymentVnpayErrorResponse:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           example: "99"
 *         message:
 *           type: string
 *           example: "Internal server error"
 */

// ─── Endpoint: Create Payment ────────────────────────────────────

/**
 * @openapi
 * /api/payment/vnpay/create:
 *   post:
 *     summary: Create a new VNPay payment
 *     description: Creates a wallet transaction (PENDING) and generates a VNPay payment URL for the user to complete payment. Requires authentication.
 *     tags: [PaymentVnpay]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreatePaymentVnpayRequest"
 *     responses:
 *       200:
 *         description: Payment URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/CreatePaymentVnpayResponse"
 *       400:
 *         description: Invalid request (missing fields, amount too low, invalid type/method)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentVnpayErrorResponse"
 *       401:
 *         description: Unauthorized — missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentVnpayErrorResponse"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentVnpayErrorResponse"
 */

// ─── Endpoint: VNPay Return URL ──────────────────────────────────

/**
 * @openapi
 * /api/payment/vnpay/return:
 *   get:
 *     summary: Handle VNPay redirect after payment
 *     description: |
 *       VNPay redirects the user to this URL after payment completion.
 *       Verifies the return hash signature, looks up the transaction, and returns the payment result as JSON.
 *       Note: This endpoint does NOT update transaction status — that is handled by the IPN endpoint.
 *     tags: [PaymentVnpay]
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction reference (payment_order_id)
 *         example: "TRANS-1775225730486-2d7a323c"
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         required: true
 *         description: VNPay response code ("00" = success)
 *         example: "00"
 *       - in: query
 *         name: vnp_Amount
 *         schema:
 *           type: string
 *         required: true
 *         description: Amount in VNPay format (actual amount × 100)
 *         example: "10000000"
 *       - in: query
 *         name: vnp_BankCode
 *         schema:
 *           type: string
 *         description: Bank code used for payment
 *         example: "NCB"
 *       - in: query
 *         name: vnp_TransactionNo
 *         schema:
 *           type: string
 *         description: VNPay transaction number
 *         example: "14422858"
 *       - in: query
 *         name: vnp_PayDate
 *         schema:
 *           type: string
 *         description: Payment date (YYYYMMDDHHmmss)
 *         example: "20260408153000"
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *         required: true
 *         description: HMAC SHA512 hash for signature verification
 *     responses:
 *       200:
 *         description: Payment result returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HandleReturnVnpayResponse"
 *       400:
 *         description: Invalid signature
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "97"
 *                 message:
 *                   type: string
 *                   example: "Invalid Signature"
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "01"
 *                 message:
 *                   type: string
 *                   example: "Order Not Found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentVnpayErrorResponse"
 */

// ─── Endpoint: VNPay IPN ─────────────────────────────────────────

/**
 * @openapi
 * /api/payment/vnpay/ipn:
 *   get:
 *     summary: Handle VNPay IPN (Instant Payment Notification)
 *     description: |
 *       Receives IPN from VNPay server to confirm payment result.
 *       Verifies secure hash, validates amount, updates transaction status, and updates wallet balance on success.
 *       Always returns a VNPay-compatible response with RspCode and Message.
 *     tags: [PaymentVnpay]
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction reference (payment_order_id)
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         required: true
 *         description: VNPay response code ("00" = success)
 *       - in: query
 *         name: vnp_TransactionStatus
 *         schema:
 *           type: string
 *         required: true
 *         description: VNPay transaction status ("00" = success)
 *       - in: query
 *         name: vnp_Amount
 *         schema:
 *           type: string
 *         required: true
 *         description: Amount in VNPay format (actual amount × 100)
 *       - in: query
 *         name: vnp_TransactionNo
 *         schema:
 *           type: string
 *         description: VNPay transaction number
 *       - in: query
 *         name: vnp_PayDate
 *         schema:
 *           type: string
 *         description: Payment date (YYYYMMDDHHmmss)
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *         required: true
 *         description: HMAC SHA512 hash for signature verification
 *     responses:
 *       200:
 *         description: IPN processed — always returns 200 to VNPay
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/VnpayIpnResponse"
 */

/**
 * @openapi
 * /api/payment/vnpay/ipn:
 *   post:
 *     summary: Handle VNPay IPN (POST variant)
 *     description: Same as GET /ipn — VNPay may send IPN via POST. See GET /ipn for full documentation.
 *     tags: [PaymentVnpay]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: IPN processed — always returns 200 to VNPay
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/VnpayIpnResponse"
 */

// ─── Endpoint: Query Transaction ─────────────────────────────────

/**
 * @openapi
 * /api/payment/vnpay/query:
 *   get:
 *     summary: Query transaction status
 *     description: Retrieves the current status of a wallet transaction by its payment_order_id.
 *     tags: [PaymentVnpay]
 *     parameters:
 *       - in: query
 *         name: payment_order_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction order ID
 *         example: "TRANS-1775225730486-2d7a323c"
 *     responses:
 *       200:
 *         description: Transaction status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/QueryTransactionVnpayResponse"
 *       400:
 *         description: Missing payment_order_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "01"
 *                 message:
 *                   type: string
 *                   example: "Missing payment_order_id"
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "02"
 *                 message:
 *                   type: string
 *                   example: "Order not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentVnpayErrorResponse"
 */

// ─── Endpoint: Refund Transaction ────────────────────────────────

/**
 * @openapi
 * /api/payment/vnpay/refund:
 *   post:
 *     summary: Refund a VNPay transaction
 *     description: |
 *       Initiates a refund for a completed VNPay transaction.
 *       Validates the transaction exists and is in COMPLETED status, then sends a refund request to VNPay API.
 *     tags: [PaymentVnpay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RefundVnpayRequest"
 *     responses:
 *       200:
 *         description: Refund processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/RefundVnpayResponse"
 *       400:
 *         description: Missing required fields or order not in refundable state
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentVnpayErrorResponse"
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   example: "02"
 *                 message:
 *                   type: string
 *                   example: "Order not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/PaymentVnpayErrorResponse"
 */
