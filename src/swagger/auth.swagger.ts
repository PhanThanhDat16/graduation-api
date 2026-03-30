/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           example: admin@example.com
 *         password:
 *           type: string
 *           example: "123456"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Login successfully
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 avatar:
 *                   type: string
 *     RefreshTokenRequest:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Refresh token successfully
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *     LogoutRequest:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error / Incorrect credentials
 */

/**
 * @openapi
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       403:
 *         description: Not authenticated / Invalid token
 */

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (delete refresh token)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */

/**
 * @openapi
 * /api/auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Login with Google
 *     description: Redirect flow endpoint. Open this URL directly in browser tab; Swagger Try it out uses fetch/XHR and usually fails for OAuth redirects.
 *     responses:
 *       302:
 *         description: Redirect to Google login page
 */

/**
 * @openapi
 * /api/auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth callback
 *     description: Google redirects to this endpoint after successful authentication
 *     responses:
 *       302:
 *         description: Redirect to frontend with accessToken
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ForgotPasswordRequestOtp:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           example: "user@example.com"
 *     ForgotPasswordVerifyOtp:
 *       type: object
 *       required: [email, otp]
 *       properties:
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         otp:
 *           type: string
 *           example: "123456"
 *     ForgotPasswordVerifyResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "OTP verified successfully"
 *         resetToken:
 *           type: string
 *     ForgotPasswordReset:
 *       type: object
 *       required: [email, newPassword, resetToken]
 *       properties:
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         newPassword:
 *           type: string
 *           example: "newpassword123"
 *         resetToken:
 *           type: string
 */

/**
 * @openapi
 * /api/auth/password/forgot:
 *   post:
 *     tags: [Auth]
 *     summary: Request OTP for forgot password
 *     description: Send OTP to email for password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequestOtp'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */

/**
 * @openapi
 * /api/auth/password/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP for forgot password
 *     description: Verify OTP and get reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordVerifyOtp'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPasswordVerifyResponse'
 *       400:
 *         description: Email and OTP are required
 */