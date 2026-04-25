/**
 * @openapi
 * tags:
 *   - name: AccountsBank
 *     description: Bank account management endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     AccountData:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *         userId:
 *           type: string
 *           example: "64f1a2b3c4d5e6f7a8b9c0d0"
 *         code:
 *           type: string
 *           example: "VCB"
 *         bankShortName:
 *           type: string
 *           example: "Vietcombank"
 *         accountNumber:
 *           type: string
 *           example: "1234567890"
 *         accountName:
 *           type: string
 *           example: "NGO THANH TIEN"
 *         logo:
 *           type: string
 *           example: "https://api.vietqr.io/img/VCB.png"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AccountListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get bank accounts successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AccountData'
 *     AccountSingleResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get bank account successfully"
 *         data:
 *           $ref: '#/components/schemas/AccountData'
 *     AccountDeleteResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Delete bank account successfully"
 *     CreateAccountRequest:
 *       type: object
 *       required: [code, bankShortName, accountNumber, accountName, logo]
 *       properties:
 *         code:
 *           type: string
 *           example: "VCB"
 *         bankShortName:
 *           type: string
 *           example: "Vietcombank"
 *         accountNumber:
 *           type: string
 *           example: "1903456789012"
 *         accountName:
 *           type: string
 *           example: "NGO THANH TIEN"
 *         logo:
 *           type: string
 *           example: "https://api.vietqr.io/img/VCB.png"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *     UpdateAccountRequest:
 *       type: object
 *       properties:
 *         accountNumber:
 *           type: string
 *           example: "1903456789012"
 *         accountName:
 *           type: string
 *           example: "NGO THANH TIEN"
 *     UpdateStatusRequest:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           example: inactive
 */

/**
 * @openapi
 * /api/accounts/bank:
 *   post:
 *     tags: [AccountsBank]
 *     summary: Create a new bank account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccountRequest'
 *     responses:
 *       200:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountSingleResponse'
 *       400:
 *         description: All fields are required / Account already exists
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/accounts/bank/my-accounts:
 *   get:
 *     tags: [AccountsBank]
 *     summary: Get all bank accounts of the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountListResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/accounts/bank/status/{id}:
 *   patch:
 *     tags: [AccountsBank]
 *     summary: Update status of a bank account (active / inactive)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatusRequest'
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountSingleResponse'
 *       400:
 *         description: ID account is required / Update bank account failed
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/accounts/bank/{id}:
 *   get:
 *     tags: [AccountsBank]
 *     summary: Get a bank account by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountSingleResponse'
 *       400:
 *         description: ID account is required / Get bank account failed
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [AccountsBank]
 *     summary: Update account number or account name
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAccountRequest'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountSingleResponse'
 *       400:
 *         description: ID account is required / Update bank account failed
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags: [AccountsBank]
 *     summary: Delete a bank account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountDeleteResponse'
 *       400:
 *         description: ID account is required / Delete bank account failed
 *       401:
 *         description: Unauthorized
 */
