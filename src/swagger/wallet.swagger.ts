/**
 * @openapi
 * tags:
 *   - name: Wallet
 *     description: Wallet management endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     WalletData:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: string
 *         balance:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     WalletResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/WalletData'
 *     BalanceResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             balance:
 *               type: number
 *     TransactionData:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         wallet_id:
 *           type: string
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *           enum: [deposit, withdraw, escrow_deposit, escrow_release, refund, admin_fee]
 *         method_payment:
 *           type: string
 *           enum: [momo, vnpay, wallet]
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *         user_id:
 *           type: string
 *         contract_id:
 *           type: string
 *           description: Contract ID if transaction is related to a contract
 *         payer_type:
 *           type: string
 *           enum: [contractor, freelancer, admin]
 *           description: Who made this payment (for contract transactions)
 *         payment_order_id:
 *           type: string
 *           description: Payment order ID if transaction is related to a payment order
 *         description:
 *           type: string
 *           description: Transaction description
 *         createdAt:
 *           type: string
 *           format: date-time
 *     TransactionListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TransactionData'
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
 *     DepositRequest:
 *       type: object
 *       required: [amount, method_payment]
 *       properties:
 *         amount:
 *           type: number
 *           example: 100000
 *         method_payment:
 *           type: string
 *           enum: [momo, vnpay, wallet]
 *           example: momo
 *     DepositResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             wallet:
 *               $ref: '#/components/schemas/WalletData'
 *             transaction:
 *               $ref: '#/components/schemas/TransactionData'
 *     UserDataResponseInWithdraw:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         avatar:
 *           type: string
 *     AccountDataResponseInWithdraw:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           $ref: '#/components/schemas/UserDataResponseInWithdraw'
 *         accountNumber:
 *           type: string
 *         accountName:
 *           type: string
 *         bankShortName:
 *           type: string
 *         code:
 *           type: string
 *         logo:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     WithdrawRequestData:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         account_id:
 *           $ref: '#/components/schemas/AccountDataResponseInWithdraw'
 *         amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, paid]
 *         admin_id:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         processed_at:
 *           type: string
 *           format: date-time
 *     WithdrawRequestResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/WithdrawRequestData'
 *     WithdrawRequestListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WithdrawRequestData'
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
 *     CreateWithdrawRequest:
 *       type: object
 *       required: [amount]
 *       properties:
 *         account_id:
 *           type: string
 *           example: 68f5a7b9c1d2e3f4a5b6c7d8
 *         amount:
 *           type: number
 *           example: 50000
 *     ProcessWithdrawRequest:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [approved, rejected, paid]
 *           example: approved
 *     AdminDepositRequest:
 *       type: object
 *       required: [amount]
 *       properties:
 *         amount:
 *           type: number
 *           example: 100000
 *         method_payment:
 *           type: string
 *           enum: [momo, vnpay, wallet]
 *           example: wallet
 */

/**
 * @openapi
 * /api/wallets/balance:
 *   get:
 *     tags: [Wallet]
 *     summary: Get my wallet balance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BalanceResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/wallets/me:
 *   get:
 *     tags: [Wallet]
 *     summary: Get my wallet
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WalletResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/wallets/deposit:
 *   post:
 *     tags: [Wallet]
 *     summary: Deposit to my wallet
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DepositRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepositResponse'
 *       400:
 *         description: Amount must be greater than 0 / Valid method_payment is required
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/wallets/transactions:
 *   get:
 *     tags: [Wallet]
 *     summary: Get my transaction history
 *     security:
 *       - bearerAuth: []
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [deposit, withdraw, escrow_deposit, escrow_release, refund, admin_fee]
 *       - in: query
 *         name: method_payment
 *         schema:
 *           type: string
 *           enum: [momo, vnpay, wallet]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionListResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/wallets/withdraw-requests:
 *   post:
 *     tags: [Wallet]
 *     summary: Create withdraw request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWithdrawRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WithdrawRequestResponse'
 *       400:
 *         description: Amount must be greater than 0 / Insufficient balance / Already have pending request
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags: [Wallet]
 *     summary: Get my withdraw requests
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, paid]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WithdrawRequestListResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/wallets/withdraw-requests/{id}:
 *   delete:
 *     tags: [Wallet]
 *     summary: Cancel withdraw request
 *     security:
 *       - bearerAuth: []
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
 *         description: Request ID is required / Request cannot be cancelled
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/wallets/admin/withdraw-requests:
 *   get:
 *     tags: [Wallet]
 *     summary: "[Admin] Get all withdraw requests"
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, paid]
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WithdrawRequestListResponse'
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/wallets/admin/withdraw-requests/{id}:
 *   put:
 *     tags: [Wallet]
 *     summary: "[Admin] Process withdraw request"
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/ProcessWithdrawRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WithdrawRequestResponse'
 *       400:
 *         description: Invalid status / Request already processed
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/wallets/admin/users/{userId}:
 *   get:
 *     tags: [Wallet]
 *     summary: "[Admin] Get user wallet"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WalletResponse'
 *       400:
 *         description: User ID is required
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/wallets/admin/users/{userId}/deposit:
 *   post:
 *     tags: [Wallet]
 *     summary: "[Admin] Deposit to user wallet"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminDepositRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepositResponse'
 *       400:
 *         description: User ID is required / Amount must be greater than 0
 *       401:
 *         description: Unauthorized
 */
