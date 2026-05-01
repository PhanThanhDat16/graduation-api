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
 *       required: [contractId, rating, comment]
 *       properties:
 *         contractId:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfe"
 *         rating:
 *           type: number
 *           example: 5
 *         comment:
 *           type: string
 *           example: "Great job!"
 *     UpdateReviewRequest:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *           example: 5
 *         comment:
 *           type: string
 *           example: "Great job!"
 *     UserReviewObject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "69ec4f6eb4b2bd652c26743d"
 *         avatar:
 *           type: string
 *           example: "https://api.dicebear.com/7.x/identicon/svg?seed=ngothanhtien1406%40gmail.com"
 *         email:
 *           type: string
 *           example: "ngothanhtien1406@gmail.com"
 *         fullName:
 *           type: string
 *           example: "Ngô Thành Tiến"
 *     ReviewObject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "69f375b84525fe164ac54af4"
 *         contractId:
 *           type: string
 *           example: "69ddfeee1dfc5f268af74bc0"
 *         reviewerId:
 *           $ref: '#/components/schemas/UserReviewObject'
 *         revieweeId:
 *           $ref: '#/components/schemas/UserReviewObject'
 *         role:
 *           type: string
 *           enum: [freelancer, contractor]
 *           example: "freelancer"
 *         rating:
 *           type: number
 *           example: 4.9
 *         comment:
 *           type: string
 *           example: "It's very great company i ever seen before gooddddd"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-04-30T15:31:04.538Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-04-30T15:38:43.731Z"
 *     ReviewResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Create review successfully"
 *         data:
 *           $ref: '#/components/schemas/ReviewObject'
 *     ArrayReviewResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get reviews successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReviewObject'
 *     UserReviewsResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get reviews successfully"
 *         data:
 *           type: object
 *           properties:
 *             received:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReviewObject'
 *             given:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReviewObject'
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
 *           example: "Action failed"
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [freelancer, contractor]
 *         description: Filter by role
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
 *               $ref: '#/components/schemas/ArrayReviewResponse'
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewErrorResponse'
 */

/**
 * @openapi
 * /api/reviews/user/{userId}:
 *   get:
 *     tags: [Review]
 *     summary: Get reviews of a user by user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [received, given]
 *         description: Type of review (received or given)
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserReviewsResponse'
 *       404:
 *         description: Review not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewErrorResponse'
 */

/**
 * @openapi
 * /api/reviews/me:
 *   get:
 *     tags: [Review]
 *     summary: Get my reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [received, given]
 *         description: Type of review (received or given)
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserReviewsResponse'
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
 * /api/reviews/user/{userId}/average-rating:
 *   get:
 *     tags: [Review]
 *     summary: Get average rating of a user by user ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Average rating details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Get average rating successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     averageRating:
 *                       type: number
 *                       example: 4.5
 *                     totalReviews:
 *                       type: number
 *                       example: 10
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
