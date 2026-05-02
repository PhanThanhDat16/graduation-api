/**
 * @openapi
 * tags:
 *   - name: Contract
 *     description: Contract management endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ContractData:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         projectId:
 *           type: string
 *         applicationId:
 *           type: string
 *         contractorId:
 *           type: object
 *         freelancerId:
 *           type: object
 *         description:
 *           type: string
 *         contractorTerms:
 *           type: string
 *         freelancerTerms:
 *           type: string
 *         totalAmount:
 *           type: number
 *           description: Số tiền dự án (freelancer nhận khi hoàn thành)
 *         adminFee:
 *           type: number
 *           description: Phí platform
 *         freelancerDeposit:
 *           type: number
 *           description: Tiền đặt cọc freelancer (hoàn lại khi hoàn thành)
 *         contractorAgreed:
 *           type: boolean
 *         freelancerAgreed:
 *           type: boolean
 *         deadline:
 *           type: string
 *           format: date-time
 *         contractorPaid:
 *           type: boolean
 *         freelancerPaid:
 *           type: boolean
 *         contractorPaidAmount:
 *           type: number
 *         freelancerPaidAmount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [draft, pending_agreement, waiting_payment, running, submitted, completed, dispute, cancelled]
 *         escrowStatus:
 *           type: string
 *           enum: [pending, partial, funded, locked, released, refunded, split]
 *         totalEscrowAmount:
 *           type: number
 *         releasedToFreelancer:
 *           type: number
 *         refundedToContractor:
 *           type: number
 *         refundedToFreelancer:
 *           type: number
 *         adminFeeCollected:
 *           type: number
 *         githubLink:
 *           type: string
 *           description: GitHub link submitted by freelancer
 *         webLink:
 *           type: string
 *           description: Web link submitted by freelancer
 *         submittedAt:
 *           type: string
 *           format: date-time
 *         paymentInfo:
 *           type: object
 *           properties:
 *             contractorMustPay:
 *               type: number
 *             freelancerMustPay:
 *               type: number
 *             contractorRemaining:
 *               type: number
 *             freelancerRemaining:
 *               type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ContractResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/ContractData'
 *     ContractListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContractData'
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
 *     CreateContractRequest:
 *       type: object
 *       required: [projectId, freelancerId, totalAmount]
 *       properties:
 *         projectId:
 *           type: string
 *         applicationId:
 *           type: string
 *         freelancerId:
 *           type: string
 *         description:
 *           type: string
 *         contractorTerms:
 *           type: string
 *         freelancerTerms:
 *           type: string
 *         totalAmount:
 *           type: number
 *           description: Số tiền dự án
 *         adminFee:
 *           type: number
 *           description: Phí platform (mặc định 0)
 *         freelancerDeposit:
 *           type: number
 *           description: Tiền đặt cọc freelancer (mặc định 0)
 *         deadline:
 *           type: string
 *           format: date-time
 *     UpdateContractRequest:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *         contractorTerms:
 *           type: string
 *         freelancerTerms:
 *           type: string
 *         totalAmount:
 *           type: number
 *         adminFee:
 *           type: number
 *         freelancerDeposit:
 *           type: number
 *         deadline:
 *           type: string
 *           format: date-time
 *     SubmitContractRequest:
 *       type: object
 *       properties:
 *         githubLink:
 *           type: string
 *           description: GitHub repository link
 *         webLink:
 *           type: string
 *           description: Live website/demo link
 *     ExtendDeadlineRequest:
 *       type: object
 *       required: [deadline]
 *       properties:
 *         deadline:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/contracts:
 *   post:
 *     tags: [Contract]
 *     summary: Create new contract (as contractor)
 *     description: |
 *       Contractor tạo hợp đồng mới.
 *       - totalAmount: Số tiền freelancer sẽ nhận
 *       - adminFee: Phí platform
 *       - freelancerDeposit: Tiền đặt cọc freelancer (nếu cần)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateContractRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContractResponse'
 *   get:
 *     tags: [Contract]
 *     summary: "[Admin] Get all contracts"
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
 *           enum: [draft, pending_agreement, waiting_payment, running, submitted, completed, dispute, cancelled]
 *       - in: query
 *         name: escrowStatus
 *         schema:
 *           type: string
 *       - in: query
 *         name: contractorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: freelancerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContractListResponse'
 */

/**
 * @openapi
 * /api/contracts/me:
 *   get:
 *     tags: [Contract]
 *     summary: Get my contracts (as contractor or freelancer)
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
 *       - in: query
 *         name: escrowStatus
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContractListResponse'
 */

/**
 * @openapi
 * /api/contracts/{id}:
 *   get:
 *     tags: [Contract]
 *     summary: Get contract by ID
 *     description: Returns contract details with paymentInfo showing how much each party needs to pay
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
 *               $ref: '#/components/schemas/ContractResponse'
 *   put:
 *     tags: [Contract]
 *     summary: Update contract (only in draft/pending_agreement status)
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
 *             $ref: '#/components/schemas/UpdateContractRequest'
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @openapi
 * /api/contracts/{id}/agree:
 *   post:
 *     tags: [Contract]
 *     summary: Agree to contract terms
 *     description: Both contractor and freelancer must agree. When both agree, status changes to waiting_payment
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
 * /api/contracts/{id}/pay:
 *   post:
 *     tags: [Contract]
 *     summary: Pay deposit for contract
 *     description: |
 *       - Contractor pays: totalAmount + adminFee
 *       - Freelancer pays: freelancerDeposit (if > 0)
 *       When both paid (or freelancerDeposit = 0), status changes to running
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
 * /api/contracts/{id}/submit:
 *   post:
 *     tags: [Contract]
 *     summary: Submit contract (freelancer only)
 *     description: Freelancer marks work as done with optional GitHub and web links
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitContractRequest'
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
 * /api/contracts/{id}/complete:
 *   post:
 *     tags: [Contract]
 *     summary: Complete contract (contractor only)
 *     description: |
 *       Contractor accepts the work. This will:
 *       - Release totalAmount to freelancer
 *       - Refund freelancerDeposit to freelancer
 *       - Collect adminFee
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
 * /api/contracts/{id}/cancel:
 *   post:
 *     tags: [Contract]
 *     summary: Cancel contract (only in early stages)
 *     description: Can only cancel in draft, pending_agreement, or waiting_payment status. All deposits are refunded.
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
 * /api/contracts/{id}/extend:
 *   post:
 *     tags: [Contract]
 *     summary: Extend contract deadline
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
 *             $ref: '#/components/schemas/ExtendDeadlineRequest'
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @openapi
 * /api/contracts/{id}/payments:
 *   get:
 *     tags: [Contract]
 *     summary: Get contract payment history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
