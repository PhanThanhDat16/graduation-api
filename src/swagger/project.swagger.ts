/**
 * @openapi
 * tags:
 *   - name: Project
 *     description: Project management endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateProjectRequest:
 *       type: object
 *       required: [title, description, category, budgetMin, budgetMax]
 *       properties:
 *         title:
 *           type: string
 *           example: "Build a React Website"
 *         description:
 *           type: string
 *           example: "Looking for a developer to build a modern React website"
 *         category:
 *           type: string
 *           example: "web"
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           example: ["react", "nodejs", "typescript"]
 *         budgetMin:
 *           type: number
 *           example: 500
 *         budgetMax:
 *           type: number
 *           example: 2000
 *         status:
 *           type: string
 *           enum: [draft, open, closed]
 *           example: "open"
 *
 *     UpdateProjectRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Updated Project Title"
 *         description:
 *           type: string
 *           example: "Updated description of the project"
 *         category:
 *           type: string
 *           example: "mobile"
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           example: ["flutter", "dart"]
 *         budgetMin:
 *           type: number
 *           example: 1000
 *         budgetMax:
 *           type: number
 *           example: 3000
 *         status:
 *           type: string
 *           enum: [draft, open, closed]
 *           example: "closed"
 *
 *     ProjectObject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfe"
 *         contractorId:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfd"
 *         title:
 *           type: string
 *           example: "Build a React Website"
 *         description:
 *           type: string
 *           example: "Looking for a developer to build a modern React website"
 *         category:
 *           type: string
 *           example: "web"
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           example: ["react", "nodejs"]
 *         budgetMin:
 *           type: number
 *           example: 500
 *         budgetMax:
 *           type: number
 *           example: 2000
 *         status:
 *           type: string
 *           example: "open"
 *         likes:
 *           type: number
 *           example: 0
 *         listLike:
 *           type: array
 *           items:
 *             type: string
 *           example: []
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ProjectResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Create project successfully"
 *         data:
 *           $ref: '#/components/schemas/ProjectObject'
 *
 *     ProjectListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get all projects successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectObject'
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
 *     ProjectErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Create project failed"
 *
 *     ProjectDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Delete project successfully"
 */

/**
 * @openapi
 * /api/projects:
 *   post:
 *     tags: [Project]
 *     summary: Create a new project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       200:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       400:
 *         description: Validation error or creation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectErrorResponse'
 */

/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags: [Project]
 *     summary: Get all projects (paginated)
 *     description: Get all projects (paginated)
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
 *         description: Field to sort by (e.g. createdAt, likes)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: contractorId
 *         schema:
 *           type: string
 *         description: Filter by contractor ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (web, mobile, etc.)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, open, closed]
 *         description: Filter by status
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword in title and description
 *       - in: query
 *         name: budgetMin
 *         schema:
 *           type: number
 *         description: Filter by minimum budget
 *       - in: query
 *         name: budgetMax
 *         schema:
 *           type: number
 *         description: Filter by maximum budget
 *       - in: query
 *         name: likes
 *         schema:
 *           type: integer
 *         description: Filter by minimum number of likes
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectListResponse'
 */

/**
 * @openapi
 * /api/projects/{id}:
 *   get:
 *     tags: [Project]
 *     summary: Get a project by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 */

/**
 * @openapi
 * /api/projects/contractor:
 *   get:
 *     tags: [Project]
 *     summary: Get projects of current contractor
 *     description: Get projects of current contractor
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects of current contractor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       400:
 *         description: Contractor ID is required or query failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectErrorResponse'
 */

/**
 * @openapi
 * /api/projects/{id}:
 *   put:
 *     tags: [Project]
 *     summary: Update a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       400:
 *         description: Validation error or update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectErrorResponse'
 */

/**
 * @openapi
 * /api/projects/{id}:
 *   delete:
 *     tags: [Project]
 *     summary: Delete a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectDeleteResponse'
 *       400:
 *         description: Validation error or deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectErrorResponse'
 */

/**
 * @openapi
 * /api/projects/like/{id}:
 *   put:
 *     tags: [Project]
 *     summary: Like or dislike a project
 *     description: Toggles the like status for a user on a project. If the user has already liked the project, it removes the like (dislike). Otherwise, it adds a like.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Like/Dislike toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       400:
 *         description: Validation error or operation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectErrorResponse'
 */
