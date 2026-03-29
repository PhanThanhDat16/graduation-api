/**
 * @openapi
 * tags:
 *   - name: Dispute
 *     description: Dispute management endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     DisputeData:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         contract_id:
 *           type: object
 *         contractor_id:
 *           type: object
 *         freelancer_id:
 *           type: object
 *         opened_by:
 *           type: object
 *         status:
 *           type: string
 *           enum: [open, negotiating, admin_review, resolved, auto_closed]
 *         resolution_type:
 *           type: string
 *           enum: [extend, cancel, split, auto_close]
 *         contractor_reason:
 *           type: string
 *         freelancer_reason:
 *           type: string
 *         contractor_requested_resolution:
 *           type: string
 *         freelancer_requested_resolution:
 *           type: string
 *         contractor_agreed:
 *           type: boolean
 *         freelancer_agreed:
 *           type: boolean
 *         freelancer_amount:
 *           type: number
 *           description: Số tiền freelancer nhận khi resolve
 *         contractor_amount:
 *           type: number
 *           description: Số tiền contractor nhận khi resolve
 *         new_deadline:
 *           type: string
 *           format: date-time
 *           description: Deadline mới nếu resolution = extend
 *         admin_decision:
 *           type: string
 *         admin_id:
 *           type: object
 *         deadline_send_admin:
 *           type: string
 *           format: date-time
 *           description: 48h deadline để tự động gửi admin
 *         escalated_at:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         resolved_at:
 *           type: string
 *           format: date-time
 *     DisputeResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/DisputeData'
 *     DisputeListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DisputeData'
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
 *     CreateDisputeRequest:
 *       type: object
 *       required: [contract_id]
 *       properties:
 *         contract_id:
 *           type: string
 *         reason:
 *           type: string
 *           description: Lý do mở dispute
 *     SubmitReasonRequest:
 *       type: object
 *       required: [reason]
 *       properties:
 *         reason:
 *           type: string
 *         requested_resolution:
 *           type: string
 *     ProposeResolutionRequest:
 *       type: object
 *       required: [resolution_type]
 *       properties:
 *         resolution_type:
 *           type: string
 *           enum: [extend, cancel, split]
 *         freelancer_amount:
 *           type: number
 *           description: Required for cancel/split. Must sum to total_escrow_amount
 *         contractor_amount:
 *           type: number
 *           description: Required for cancel/split. Must sum to total_escrow_amount
 *         new_deadline:
 *           type: string
 *           format: date-time
 *           description: Required for extend resolution
 *     AdminResolveRequest:
 *       type: object
 *       required: [decision, resolution_type]
 *       properties:
 *         decision:
 *           type: string
 *           description: Admin's decision explanation
 *         resolution_type:
 *           type: string
 *           enum: [extend, cancel, split, auto_close]
 *         freelancer_amount:
 *           type: number
 *         contractor_amount:
 *           type: number
 *         new_deadline:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/disputes:
 *   post:
 *     tags: [Dispute]
 *     summary: Create/Open dispute
 *     description: |
 *       Opens a dispute for a contract. Only available when contract is in running or submitted status.
 *       This will change contract status to "dispute" and lock the escrow.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDisputeRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisputeResponse'
 *   get:
 *     tags: [Dispute]
 *     summary: "[Admin] Get all disputes"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, negotiating, admin_review, resolved, auto_closed]
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @openapi
 * /api/disputes/me:
 *   get:
 *     tags: [Dispute]
 *     summary: Get my disputes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @openapi
 * /api/disputes/contract/{contractId}:
 *   get:
 *     tags: [Dispute]
 *     summary: Get dispute by contract ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @openapi
 * /api/disputes/{id}:
 *   get:
 *     tags: [Dispute]
 *     summary: Get dispute by ID
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
 */

/**
 * @openapi
 * /api/disputes/{id}/reason:
 *   post:
 *     tags: [Dispute]
 *     summary: Submit reason for dispute
 *     description: Both parties can submit their reasons. Status changes to "negotiating"
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
 *             $ref: '#/components/schemas/SubmitReasonRequest'
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @openapi
 * /api/disputes/{id}/propose:
 *   post:
 *     tags: [Dispute]
 *     summary: Propose resolution
 *     description: |
 *       Propose a resolution for the dispute:
 *       - **extend**: Continue contract with new deadline (requires new_deadline)
 *       - **cancel**: Cancel and refund (requires freelancer_amount + contractor_amount = total_escrow)
 *       - **split**: Split escrow between parties (requires freelancer_amount + contractor_amount = total_escrow)
 *
 *       The proposer automatically agrees. Other party needs to call /agree endpoint.
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
 *             $ref: '#/components/schemas/ProposeResolutionRequest'
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @openapi
 * /api/disputes/{id}/agree:
 *   post:
 *     tags: [Dispute]
 *     summary: Agree to proposed resolution
 *     description: When both parties agree, the resolution is executed automatically
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
 */

/**
 * @openapi
 * /api/disputes/{id}/escalate:
 *   post:
 *     tags: [Dispute]
 *     summary: Escalate dispute to admin
 *     description: If parties cannot agree, escalate to admin for resolution
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
 */

/**
 * @openapi
 * /api/disputes/{id}/admin/resolve:
 *   post:
 *     tags: [Dispute]
 *     summary: "[Admin] Resolve dispute"
 *     description: Admin makes final decision on the dispute
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
 *             $ref: '#/components/schemas/AdminResolveRequest'
 *     responses:
 *       200:
 *         description: OK
 */
