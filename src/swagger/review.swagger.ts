/**
 * @openapi
 * tags:
 *   - name: Review
 *     description: Review management endpoints
 */

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:   
 *     CreateReviewRequest:
 *       type: object
 *       required: [contract_id, freelancer_id, rating, comment]
 *       properties:
 *         contract_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfe"
 *         freelancer_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfd"
 *         rating:
 *           type: number
 *           example: 5
 *         comment:
 *           type: string
 *           example: "Great freelancer!"
 *     UpdateReviewRequest:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *           example: 5
 *         comment:
 *           type: string
 *           example: "Great freelancer!"
 *     ReviewObject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfe"
 *         contract_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfe"
 *         contractor_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfd"
 *         freelancer_id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfe"
 *         rating:
 *           type: number
 *           example: 5
 *         comment:
 *           type: string
 *           example: "Great freelancer!"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ReviewResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Create review successfully"
 *         data:
 *           $ref: '#/components/schemas/ReviewObject'
 *     ReviewListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get all reviews successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReviewObject'
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
 *     ReviewErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Create review failed"
 *     ReviewDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Delete review successfully"
 */

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     tags: [Review]
 *     summary: Create a new review
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewRequest'
 *     responses:
 *       200:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponse'
 *       400:
 *         description: Validation error or creation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewErrorResponse'
 */

/**
 * @openapi
 * /api/reviews:
 *   get:
 *     tags: [Review]
 *     summary: Get all reviews (paginated)
 *     description: Get all reviews (paginated)
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
 *         description: Field to sort by (e.g. createdAt, rating)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *         description: Filter by contract ID
 *       - in: query
 *         name: contractor_id
 *         schema:
 *           type: string
 *         description: Filter by contractor ID
 *       - in: query
 *         name: freelancer_id
 *         schema:
 *           type: string
 *         description: Filter by freelancer ID
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *         description: Filter by rating
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *         description: Filter by minimum rating
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *         description: Filter by maximum rating
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewListResponse'
 */

/**
 * @openapi
 * /api/reviews/contract/{contractId}:
 *   get:
 *     tags: [Review]
 *     summary: Get a review by contract ID
 *     parameters:
 *       - in: path
 *         name: contractId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     responses:
 *       200:
 *         description: Review details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponse'
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewErrorResponse'
 */

/**
 * @openapi
 * /api/reviews/{id}:
 *   get:
 *     tags: [Review]
 *     summary: Get a review by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponse'
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewErrorResponse'
 */

/**
 * @openapi
 * /api/reviews/me/contractor:
 *   get:
 *     tags: [Review]
 *     summary: Get reviews of a contractor by contractor ID
 *     description: Get reviews of a contractor by contractor ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contractorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contractor ID
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
 *         description: Field to sort by (e.g. createdAt, rating)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *         description: Filter by contract ID
 *       - in: query
 *         name: freelancer_id
 *         schema:
 *           type: string
 *         description: Filter by freelancer ID
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *         description: Filter by rating
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *         description: Filter by minimum rating
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *         description: Filter by maximum rating
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewListResponse'
 *       400:
 *         description: Validation error or query failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewErrorResponse'
 */

/**
 * @openapi
 * /api/reviews/freelancer/{freelancerId}:
 *   get:
 *     tags: [Review]
 *     summary: Get reviews of a freelancer by freelancer ID
 *     description: Get reviews of a freelancer by freelancer ID
 *     parameters:
 *       - in: path
 *         name: freelancerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Freelancer ID
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
 *         description: Field to sort by (e.g. createdAt, rating)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *         description: Filter by contract ID
 *       - in: query
 *         name: contractor_id
 *         schema:
 *           type: string
 *         description: Filter by contractor ID
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *         description: Filter by rating
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *         description: Filter by minimum rating
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *         description: Filter by maximum rating
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewListResponse'
 *       400:
 *         description: Validation error or query failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewErrorResponse'
 */

/**
 * @openapi
 * /api/reviews/freelancer/{freelancerId}/average-rating:
 *   get:
 *     tags: [Review]
 *     summary: Get average rating of a freelancer by freelancer ID
 *     description: Get average rating of a freelancer by freelancer ID
 *     parameters:
 *       - in: path
 *         name: contractorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Contractor ID
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
 *         description: Field to sort by (e.g. createdAt, rating)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *         description: Filter by contract ID
 *       - in: query
 *         name: freelancer_id
 *         schema:
 *           type: string
 *         description: Filter by freelancer ID
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *         description: Filter by rating
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *         description: Filter by minimum rating
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *         description: Filter by maximum rating
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewListResponse'
 *       400:
 *         description: Validation error or query failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewErrorResponse'
 */

/**
 * @openapi
 * /api/reviews/{id}:
 *   put:
 *     tags: [Review]
 *     summary: Update a review by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReviewRequest'
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewResponse'
 *       400:
 *         description: Validation error or update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewErrorResponse'
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewErrorResponse'
 */ 

/**
 * @openapi
 * /api/reviews/{id}:
 *   delete:
 *     tags: [Review]
 *     summary: Delete a review by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewDeleteResponse'
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewErrorResponse'
 */ 



