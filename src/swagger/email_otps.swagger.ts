/**
 * @openapi
 * tags:
 *   - name: EmailOTP
 *     description: Email OTP endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     SendOtpRequest:
 *       type: object
 *       required: [email, purpose]
 *       properties:
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         purpose:
 *           type: string
 *           enum: [register, forgot_password, change_email]
 *           example: "register"
 *     SendOtpResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "OTP sent successfully"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *     VerifyOtpRequest:
 *       type: object
 *       required: [email, otp, purpose]
 *       properties:
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         otp:
 *           type: string
 *           example: "123456"
 *         purpose:
 *           type: string
 *           enum: [register, forgot_password, change_email]
 *           example: "register"
 *     VerifyOtpResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "OTP verified successfully"
 *     OtpRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         otp:
 *           type: string
 *         purpose:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// /**
//  * @openapi
//  * /api/email/send-otp:
//  *   post:
//  *     tags: [EmailOTP]
//  *     summary: Send OTP to email
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/SendOtpRequest'
//  *     responses:
//  *       200:
//  *         description: OK
//  *         content:
//  *           application/json:
//  *             schema:
//  *               $ref: '#/components/schemas/SendOtpResponse'
//  *       400:
//  *         description: Email and purpose are required
//  */

/**
 * @openapi
 * /api/email/verify-otp:
 *   post:
 *     tags: [EmailOTP]
 *     summary: Verify OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyOtpResponse'
 *       400:
 *         description: Email, OTP and purpose are required
 */

/**
 * @openapi
 * /api/email/resend-otp:
 *   post:
 *     tags: [EmailOTP]
 *     summary: Resend OTP
 *     description: Resend OTP to email (requires existing OTP record)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendOtpRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SendOtpResponse'
 *       400:
 *         description: Email and purpose are required
 */

// /**
//  * @openapi
//  * /api/email/get-all-otp:
//  *   get:
//  *     tags: [EmailOTP]
//  *     summary: Get all OTP records
//  *     responses:
//  *       200:
//  *         description: OK
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: "Get all OTP records successfully"
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/OtpRecord'
//  */

// /**
//  * @openapi
//  * /api/email/get-otp-by-email/{email}:
//  *   get:
//  *     tags: [EmailOTP]
//  *     summary: Get OTP record by email
//  *     parameters:
//  *       - in: path
//  *         name: email
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: OK
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   example: "Get OTP record successfully"
//  *                 data:
//  *                   $ref: '#/components/schemas/OtpRecord'
//  *       400:
//  *         description: Email is required
//  */
