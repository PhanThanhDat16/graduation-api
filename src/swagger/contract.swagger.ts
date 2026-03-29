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
 *         project_id:
 *           type: string
 *         application_id:
 *           type: string
 *         contractor_id:
 *           type: object
 *         freelancer_id:
 *           type: object
 *         description:
 *           type: string
 *         contractor_terms:
 *           type: string
 *         freelancer_terms:
 *           type: string
 *         total_amount:
 *           type: number
 *           description: Số tiền dự án (freelancer nhận khi hoàn thành)
 *         admin_fee:
 *           type: number
 *           description: Phí platform
 *         freelancer_deposit:
 *           type: number
 *           description: Tiền đặt cọc freelancer (hoàn lại khi hoàn thành)
 *         contractor_agreed:
 *           type: boolean
 *         freelancer_agreed:
 *           type: boolean
 *         deadline:
 *           type: string
 *           format: date-time
 *         contractor_paid:
 *           type: boolean
 *         freelancer_paid:
 *           type: boolean
 *         contractor_paid_amount:
 *           type: number
 *         freelancer_paid_amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [draft, pending_agreement, waiting_payment, running, submitted, completed, dispute, cancelled]
 *         escrow_status:
 *           type: string
 *           enum: [pending, partial, funded, locked, released, refunded, split]
 *         total_escrow_amount:
 *           type: number
 *         released_to_freelancer:
 *           type: number
 *         refunded_to_contractor:
 *           type: number
 *         refunded_to_freelancer:
 *           type: number
 *         admin_fee_collected:
 *           type: number
 *         payment_info:
 *           type: object
 *           properties:
 *             contractor_must_pay:
 *               type: number
 *             freelancer_must_pay:
 *               type: number
 *             contractor_remaining:
 *               type: number
 *             freelancer_remaining:
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
 *       required: [project_id, freelancer_id, total_amount]
 *       properties:
 *         project_id:
 *           type: string
 *         application_id:
 *           type: string
 *         freelancer_id:
 *           type: string
 *         description:
 *           type: string
 *         contractor_terms:
 *           type: string
 *         freelancer_terms:
 *           type: string
 *         total_amount:
 *           type: number
 *           description: Số tiền dự án
 *         admin_fee:
 *           type: number
 *           description: Phí platform (mặc định 0)
 *         freelancer_deposit:
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
 *         contractor_terms:
 *           type: string
 *         freelancer_terms:
 *           type: string
 *         total_amount:
 *           type: number
 *         admin_fee:
 *           type: number
 *         freelancer_deposit:
 *           type: number
 *         deadline:
 *           type: string
 *           format: date-time
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
 *       - total_amount: Số tiền freelancer sẽ nhận
 *       - admin_fee: Phí platform
 *       - freelancer_deposit: Tiền đặt cọc freelancer (nếu cần)
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
 *         name: escrow_status
 *         schema:
 *           type: string
 *       - in: query
 *         name: contractor_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: freelancer_id
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
 *         name: escrow_status
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
 *     description: Returns contract details with payment_info showing how much each party needs to pay
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
 *       - Contractor pays: total_amount + admin_fee
 *       - Freelancer pays: freelancer_deposit (if > 0)
 *       When both paid (or freelancer_deposit = 0), status changes to running
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
 *     description: Freelancer marks work as done
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
 *       - Release total_amount to freelancer
 *       - Refund freelancer_deposit to freelancer
 *       - Collect admin_fee
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
