/**
 * @openapi
 * tags:
 *   - name: AdminHistory
 *     description: Admin history management endpoints (all routes require authentication)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateAdminHistoryRequest:
 *       type: object
 *       required: [action, note]
 *       properties:
 *         contract_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfe"
 *           description: Contract ID (optional)
 *         dispute_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acff"
 *           description: Dispute ID (optional)
 *         user_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734ad00"
 *           description: Target user ID (optional)
 *         action:
 *           type: string
 *           enum:
 *             - approve_contract
 *             - reject_contract
 *             - cancel_contract
 *             - complete_contract
 *             - open_dispute
 *             - resolve_dispute
 *             - close_dispute
 *             - review_dispute
 *             - ban_user
 *             - unban_user
 *             - warn_user
 *             - verify_user
 *             - other
 *           example: "approve_contract"
 *         note:
 *           type: string
 *           example: "Contract approved after review"
 *
 *     UpdateAdminHistoryRequest:
 *       type: object
 *       properties:
 *         action:
 *           type: string
 *           enum:
 *             - approve_contract
 *             - reject_contract
 *             - cancel_contract
 *             - complete_contract
 *             - open_dispute
 *             - resolve_dispute
 *             - close_dispute
 *             - review_dispute
 *             - ban_user
 *             - unban_user
 *             - warn_user
 *             - verify_user
 *             - other
 *           example: "reject_contract"
 *         note:
 *           type: string
 *           example: "Updated note for this action"
 *
 *     AdminHistoryObject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734ad01"
 *         admin_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfd"
 *         contract_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfe"
 *         dispute_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acff"
 *         user_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734ad00"
 *         action:
 *           type: string
 *           example: "approve_contract"
 *         note:
 *           type: string
 *           example: "Contract approved after review"
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     AdminHistoryPopulatedObject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734ad01"
 *         admin_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "60a7b2f7c6e9fa001734acfd"
 *             name:
 *               type: string
 *               example: "Admin User"
 *             email:
 *               type: string
 *               example: "admin@example.com"
 *             avatar:
 *               type: string
 *               example: "https://example.com/avatar.jpg"
 *         contract_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "60a7b2f7c6e9fa001734acfe"
 *             project_id:
 *               type: string
 *               example: "60a7b2f7c6e9fa001734acf0"
 *             status:
 *               type: string
 *               example: "running"
 *         dispute_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "60a7b2f7c6e9fa001734acff"
 *             status:
 *               type: string
 *               example: "open"
 *             reason:
 *               type: string
 *               example: "Quality of work not met"
 *         user_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "60a7b2f7c6e9fa001734ad00"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               example: "john@example.com"
 *             avatar:
 *               type: string
 *               example: "https://example.com/john-avatar.jpg"
 *         action:
 *           type: string
 *           example: "approve_contract"
 *         note:
 *           type: string
 *           example: "Contract approved after review"
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     AdminHistoryResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get admin history successfully"
 *         data:
 *           $ref: '#/components/schemas/AdminHistoryPopulatedObject'
 *
 *     AdminHistoryListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get all admin histories successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminHistoryObject'
 *         page:
 *           type: number
 *           example: 1
 *         limit:
 *           type: number
 *           example: 10
 *         totalPages:
 *           type: number
 *           example: 1
 *         totalItems:
 *           type: number
 *           example: 5
 *
 *     AdminHistoryArrayResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get histories successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminHistoryObject'
 *
 *     AdminHistoryErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Create admin history failed"
 *
 *     AdminHistoryDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Admin history deleted successfully"
 */

/**
 * @openapi
 * /api/admin-histories:
 *   post:
 *     tags: [AdminHistory]
 *     summary: Create a new admin history entry
 *     description: Creates a new admin action history record. The admin_id is automatically taken from the authenticated user's token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminHistoryRequest'
 *     responses:
 *       200:
 *         description: Admin history created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Create admin history successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AdminHistoryObject'
 *       400:
 *         description: Validation error or creation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryErrorResponse'
 */

/**
 * @openapi
 * /api/admin-histories:
 *   get:
 *     tags: [AdminHistory]
 *     summary: Get all admin histories (paginated)
 *     description: Retrieve all admin history records with pagination and optional filters.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by (e.g. createdAt)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: admin_id
 *         schema:
 *           type: string
 *         description: Filter by admin ID
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *         description: Filter by contract ID
 *       - in: query
 *         name: dispute_id
 *         schema:
 *           type: string
 *         description: Filter by dispute ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filter by target user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum:
 *             - approve_contract
 *             - reject_contract
 *             - cancel_contract
 *             - complete_contract
 *             - open_dispute
 *             - resolve_dispute
 *             - close_dispute
 *             - review_dispute
 *             - ban_user
 *             - unban_user
 *             - warn_user
 *             - verify_user
 *             - other
 *         description: Filter by action type
 *     responses:
 *       200:
 *         description: List of admin histories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryListResponse'
 */

/**
 * @openapi
 * /api/admin-histories/me:
 *   get:
 *     tags: [AdminHistory]
 *     summary: Get current admin's history entries
 *     description: Retrieve all history entries created by the currently authenticated admin, sorted by newest first.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin's history entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryArrayResponse'
 *       400:
 *         description: Admin ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryErrorResponse'
 */

/**
 * @openapi
 * /api/admin-histories/contract/{contractId}:
 *   get:
 *     tags: [AdminHistory]
 *     summary: Get histories by contract ID
 *     description: Retrieve all admin history entries related to a specific contract, sorted by newest first.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     responses:
 *       200:
 *         description: Contract-related history entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryArrayResponse'
 *       400:
 *         description: Contract ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryErrorResponse'
 */

/**
 * @openapi
 * /api/admin-histories/dispute/{disputeId}:
 *   get:
 *     tags: [AdminHistory]
 *     summary: Get histories by dispute ID
 *     description: Retrieve all admin history entries related to a specific dispute, sorted by newest first.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: disputeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dispute ID
 *     responses:
 *       200:
 *         description: Dispute-related history entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryArrayResponse'
 *       400:
 *         description: Dispute ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryErrorResponse'
 */

/**
 * @openapi
 * /api/admin-histories/user/{userId}:
 *   get:
 *     tags: [AdminHistory]
 *     summary: Get histories by user ID
 *     description: Retrieve all admin history entries targeting a specific user, sorted by newest first.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Target user ID
 *     responses:
 *       200:
 *         description: User-related history entries
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryArrayResponse'
 *       400:
 *         description: User ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryErrorResponse'
 */

/**
 * @openapi
 * /api/admin-histories/{id}:
 *   get:
 *     tags: [AdminHistory]
 *     summary: Get admin history by ID
 *     description: Retrieve a single admin history entry by its ID, with populated references (admin, contract, dispute, user).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin history ID
 *     responses:
 *       200:
 *         description: Admin history details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryResponse'
 *       400:
 *         description: Invalid ID or not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryErrorResponse'
 */

/**
 * @openapi
 * /api/admin-histories/{id}:
 *   put:
 *     tags: [AdminHistory]
 *     summary: Update an admin history entry
 *     description: Update the action and/or note of an admin history entry. Only the admin who created the entry can update it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin history ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdminHistoryRequest'
 *     responses:
 *       200:
 *         description: Admin history updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Update admin history successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AdminHistoryObject'
 *       400:
 *         description: Validation error, not authorized, or update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryErrorResponse'
 */

/**
 * @openapi
 * /api/admin-histories/{id}:
 *   delete:
 *     tags: [AdminHistory]
 *     summary: Delete an admin history entry
 *     description: Delete an admin history entry by its ID. Only the admin who created the entry can delete it.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin history ID
 *     responses:
 *       200:
 *         description: Admin history deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryDeleteResponse'
 *       400:
 *         description: Validation error, not authorized, or deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminHistoryErrorResponse'
 */
