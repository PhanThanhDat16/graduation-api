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
 *         contractId:
 *           type: object
 *         contractorId:
 *           type: object
 *         freelancerId:
 *           type: object
 *         openedBy:
 *           type: object
 *         status:
 *           type: string
 *           enum: [pending_reasons, waiting_escalation, open, negotiating, admin_review, resolved, auto_closed, staff_cancelled]
 *         resolutionType:
 *           type: string
 *           enum: [extend, cancel, split, auto_close]
 *         contractorReason:
 *           type: string
 *         freelancerReason:
 *           type: string
 *         contractorRequestedResolution:
 *           type: string
 *         freelancerRequestedResolution:
 *           type: string
 *         contractorAgreed:
 *           type: boolean
 *         freelancerAgreed:
 *           type: boolean
 *         freelancerAmount:
 *           type: number
 *           description: Số tiền freelancer nhận khi resolve
 *         contractorAmount:
 *           type: number
 *           description: Số tiền contractor nhận khi resolve
 *         newDeadline:
 *           type: string
 *           format: date-time
 *           description: Deadline mới nếu resolution = extend
 *         reasonDeadline:
 *           type: string
 *           format: date-time
 *           description: Deadline 1h cho cả 2 bên điền reason
 *         escalatedBy:
 *           type: object
 *           description: User nhấn escalate button
 *         staffId:
 *           type: object
 *           description: Staff xử lý dispute
 *         staffCancelReason:
 *           type: string
 *           description: Lý do staff cancel dispute
 *         staffDecision:
 *           type: string
 *           description: Staff decision khi resolve dispute
 *         escalatedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         resolvedAt:
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
 *       required: [contractId]
 *       properties:
 *         contractId:
 *           type: string
 *         reason:
 *           type: string
 *           description: Lý do mở dispute (optional)
 *     SubmitReasonRequest:
 *       type: object
 *       required: [reason]
 *       properties:
 *         reason:
 *           type: string
 *         requestedResolution:
 *           type: string
 *     ProposeResolutionRequest:
 *       type: object
 *       required: [resolutionType]
 *       properties:
 *         resolutionType:
 *           type: string
 *           enum: [extend, cancel, split]
 *         freelancerAmount:
 *           type: number
 *           description: Required for cancel/split. Must sum to totalEscrowAmount
 *         contractorAmount:
 *           type: number
 *           description: Required for cancel/split. Must sum to totalEscrowAmount
 *         newDeadline:
 *           type: string
 *           format: date-time
 *           description: Required for extend resolution
 *     StaffCancelRequest:
 *       type: object
 *       required: [reason]
 *       properties:
 *         reason:
 *           type: string
 *           description: Lý do staff cancel dispute
 *     StaffResolveRequest:
 *       type: object
 *       required: [decision, resolutionType]
 *       properties:
 *         decision:
 *           type: string
 *           description: Staff's decision explanation
 *         resolutionType:
 *           type: string
 *           enum: [extend, cancel, split, auto_close]
 *         freelancerAmount:
 *           type: number
 *         contractorAmount:
 *           type: number
 *         newDeadline:
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
 *       Creates dispute in "pending_reasons" status with 1 hour countdown for both parties to submit reasons.
 *       Contract status is NOT changed yet — only when staff joins will it change to "dispute".
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
 *     summary: "[Staff] Get all disputes"
 *     description: Staff only sees disputes from status OPEN onwards (not pending_reasons or waiting_escalation)
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
 *           enum: [pending_reasons, waiting_escalation, open, negotiating, admin_review, resolved, auto_closed, staff_cancelled]
 *       - in: query
 *         name: contractId
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
 *     description: Also auto-checks reason deadline and transitions from pending_reasons to waiting_escalation if expired
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
 *     description: |
 *       Both parties submit their reasons during the 1h countdown period.
 *       If both submit before deadline, status auto-transitions to "waiting_escalation".
 *       Allowed in pending_reasons and waiting_escalation status.
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
 * /api/disputes/{id}/escalate:
 *   post:
 *     tags: [Dispute]
 *     summary: Escalate dispute — make visible to staff
 *     description: |
 *       After the 1h countdown or when both reasons are submitted, either party can press this button.
 *       This transitions dispute to "open" status, making it visible to staff.
 *       Also changes contract status to "dispute" and locks escrow.
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
 * /api/disputes/{id}/propose:
 *   post:
 *     tags: [Dispute]
 *     summary: Propose resolution
 *     description: |
 *       Propose a resolution for the dispute (only when status is negotiating):
 *       - **extend**: Continue contract with new deadline (requires newDeadline)
 *       - **cancel**: Cancel and refund (requires freelancerAmount + contractorAmount = total_escrow)
 *       - **split**: Split escrow between parties (requires freelancerAmount + contractorAmount = total_escrow)
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
 *     description: |
 *       When both parties agree, the resolution is executed automatically:
 *       - Case 1 (EXTEND): Contract back to running, chat group type → contract_chat, disputeId → null
 *       - Case 2 (CANCEL/SPLIT): Money distributed, chat group type → contract_chat, keeps disputeId
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
 * /api/disputes/{id}/check-deadline:
 *   get:
 *     tags: [Dispute]
 *     summary: Check reason deadline
 *     description: Utility endpoint to check/transition dispute if reason deadline has passed
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
 * /api/disputes/{id}/staff/join:
 *   post:
 *     tags: [Dispute]
 *     summary: "[Staff] Join dispute group"
 *     description: |
 *       Staff joins the dispute chat group:
 *       - Adds staff to chat group memberIds
 *       - Changes group type to "dispute"
 *       - Sets disputeId on group
 *       - Dispute status changes to "negotiating"
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
 * /api/disputes/{id}/staff/cancel:
 *   post:
 *     tags: [Dispute]
 *     summary: "[Staff] Cancel dispute"
 *     description: |
 *       Staff cancels the dispute with a reason.
 *       The reason is visible to both freelancer and contractor.
 *       Contract status returns to "running".
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
 *             $ref: '#/components/schemas/StaffCancelRequest'
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @openapi
 * /api/disputes/{id}/staff/resolve:
 *   post:
 *     tags: [Dispute]
 *     summary: "[Staff] Resolve dispute"
 *     description: |
 *       Case 3: When both parties cannot agree, staff resolves the dispute.
 *       This is the final decision and executes the resolution immediately.
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
 *             $ref: '#/components/schemas/StaffResolveRequest'
 *     responses:
 *       200:
 *         description: OK
 */
