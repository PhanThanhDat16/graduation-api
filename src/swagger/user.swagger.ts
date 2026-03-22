/**
 * @openapi
 * tags:
 *   - name: User
 *     description: Users endpoints
 */

/**
 * @openapi
 * /api/user/register:
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
 */
