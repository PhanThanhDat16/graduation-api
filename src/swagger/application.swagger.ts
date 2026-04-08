/**
 * @openapi
 * tags:
 *   - name: Application
 *     description: Application management endpoints (Freelancer applies to Project)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateApplicationRequest:
 *       type: object
 *       required: [projectId, proposal, proposedBudget]
 *       properties:
 *         projectId:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfe"
 *         proposal:
 *           type: string
 *           example: "I have 5 years of experience in React and can deliver this project in 2 weeks"
 *         proposedBudget:
 *           type: number
 *           example: 1500
 *
 *     UpdateApplicationRequest:
 *       type: object
 *       properties:
 *         proposal:
 *           type: string
 *           example: "Updated proposal with more details"
 *         proposedBudget:
 *           type: number
 *           example: 1800
 *
 *     UpdateApplicationStatusRequest:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [accepted, rejected]
 *           example: "accepted"
 *
 *     ApplicationObject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acff"
 *         projectId:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfe"
 *         freelancerId:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfd"
 *         proposal:
 *           type: string
 *           example: "I have 5 years of experience in React"
 *         proposedBudget:
 *           type: number
 *           example: 1500
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *           example: "pending"
 *         appliedAt:
 *           type: string
 *           format: date-time
 *
 *     ApplicationResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Create application successfully"
 *         data:
 *           $ref: '#/components/schemas/ApplicationObject'
 *
 *     ApplicationListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get all applications successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ApplicationObject'
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
 *     ApplicationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Create application failed"
 *
 *     ApplicationDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Application deleted successfully"
 */

/**
 * @openapi
 * /api/applications:
 *   post:
 *     tags: [Application]
 *     summary: Apply to a project
 *     description: Freelancer applies to a project with proposal and budget
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApplicationRequest'
 *     responses:
 *       200:
 *         description: Application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationResponse'
 *       400:
 *         description: Validation error or creation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationErrorResponse'
 */

/**
 * @openapi
 * /api/applications:
 *   get:
 *     tags: [Application]
 *     summary: Get all applications (paginated)
 *     description: Get all applications (paginated)
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
 *         description: Field to sort by (e.g. appliedAt)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: freelancerId
 *         schema:
 *           type: string
 *         description: Filter by freelancer ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of applications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationListResponse'
 */

/**
 * @openapi
 * /api/applications/my:
 *   get:
 *     tags: [Application]
 *     summary: Get my applications
 *     description: Get all applications of current freelancer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my applications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationListResponse'
 *       400:
 *         description: Freelancer ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationErrorResponse'
 */

/**
 * @openapi
 * /api/applications/project/{projectId}:
 *   get:
 *     tags: [Application]
 *     summary: Get applications by project ID
 *     description: Get all applications for a specific project
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of applications for project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationListResponse'
 */

/**
 * @openapi
 * /api/applications/{id}:
 *   get:
 *     tags: [Application]
 *     summary: Get an application by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationResponse'
 */

/**
 * @openapi
 * /api/applications/{id}:
 *   put:
 *     tags: [Application]
 *     summary: Update an application
 *     description: Freelancer updates their application (only pending applications can be updated)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApplicationRequest'
 *     responses:
 *       200:
 *         description: Application updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationResponse'
 *       400:
 *         description: Validation error or update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationErrorResponse'
 */

/**
 * @openapi
 * /api/applications/{id}/status:
 *   put:
 *     tags: [Application]
 *     summary: Update application status
 *     description: Contractor accepts or rejects an application
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApplicationStatusRequest'
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationResponse'
 *       400:
 *         description: Validation error or update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationErrorResponse'
 */

/**
 * @openapi
 * /api/applications/{id}:
 *   delete:
 *     tags: [Application]
 *     summary: Delete an application
 *     description: Freelancer deletes their application (only pending applications can be deleted)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationDeleteResponse'
 *       400:
 *         description: Validation error or deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApplicationErrorResponse'
 */
