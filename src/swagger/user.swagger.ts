/**
 * @openapi
 * tags:
 *   - name: User
 *     description: Users endpoints
 */

/**
 * @openapi
 * /api/users/register:
 *   post:
 *     tags: [User]
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRegisterResponse'
 *       400:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     UserRegisterRequest:
 *       type: object
 *       required: [email, password, fullName, phone, address, birthday, gender, role]
 *       properties:
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           example: "yourpassword"
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           example: "0123456789"
 *         address:
 *           type: string
 *           example: "123 Main St, Hanoi, Vietnam"
 *         birthday:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         gender:
 *           type: string
 *           enum: [female, male, other]
 *           example: "male"
 *         role:
 *           type: string
 *           enum: [freelancer, contractor, staff, admin, other]
 *           example: "freelancer"
 *         avatar:
 *           type: string
 *           example: "https://example.com/avatar.png"
 *
 *     UserRegisterResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Register successfully"
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "60a7b2f7c6e9fa001734acfd"
 *             email:
 *               type: string
 *             fullName:
 *               type: string
 *             phone:
 *               type: string
 *             address:
 *               type: string
 *             birthday:
 *               type: string
 *             gender:
 *               type: string
 *             role:
 *               type: string
 *             avatar:
 *               type: string
 *     UserErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Email already exists"
 *     UserData:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         fullName:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         birthday:
 *           type: string
 *         gender:
 *           type: string
 *         role:
 *           type: string
 *         avatar:
 *           type: string
 *         isVerified:
 *           type: boolean
 *     UserListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get all users successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserData'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *             limit:
 *               type: number
 *             total:
 *               type: number
 *             totalPages:
 *               type: number
 *     UserResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/UserData'
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           example: "0123456789"
 *         address:
 *           type: string
 *           example: "123 Main St"
 *         birthday:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         gender:
 *           type: string
 *           enum: [female, male, other]
 *         description:
 *           type: string
 *         avatar:
 *           type: string
 *     UpdatePasswordRequest:
 *       type: object
 *       required: [currentPassword, newPassword]
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: "oldpassword123"
 *         newPassword:
 *           type: string
 *           example: "newpassword123"
 *     RequestEmailChangeOtpRequest:
 *       type: object
 *       required: [newEmail]
 *       properties:
 *         newEmail:
 *           type: string
 *           example: "newemail@example.com"
 *     UpdateEmailRequest:
 *       type: object
 *       required: [newEmail, otp]
 *       properties:
 *         newEmail:
 *           type: string
 *           example: "newemail@example.com"
 *         otp:
 *           type: string
 *           example: "123456"
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [User]
 *     summary: Get all users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 */

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     tags: [User]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [User]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/users/password:
 *   put:
 *     tags: [User]
 *     summary: Update current user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePasswordRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully"
 *       400:
 *         description: Current password and new password are required / Current password is incorrect
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/users/email/request-otp:
 *   post:
 *     tags: [User]
 *     summary: Request OTP to change email
 *     description: Send OTP to new email for verification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestEmailChangeOtpRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully"
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: New email is required
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/users/register/staff:
 *   post:
 *     tags: [User]
 *     summary: Register new staff member (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRegisterResponse'
 *       400:
 *         description: Email already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

/**
 * @openapi
 * /api/users/email:
 *   put:
 *     tags: [User]
 *     summary: Update current user email
 *     description: Update email after OTP verification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmailRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: New email and OTP are required / Email already in use
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [User]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *   put:
 *     tags: [User]
 *     summary: Update user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: User ID is required
 *   delete:
 *     tags: [User]
 *     summary: Delete user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: User ID is required
 */
