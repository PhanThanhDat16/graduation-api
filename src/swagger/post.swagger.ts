/**
 * @openapi
 * tags:
 *   - name: Post
 *     description: Post management endpoints
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
 *     CreatePostRequest:
 *       type: object
 *       required: [title, content]
 *       properties:
 *         title:
 *           type: string
 *           example: "My First Post"
 *         content:
 *           type: string
 *           example: "This is the content of the post"
 *
 *     UpdatePostRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Updated Post Title"
 *         content:
 *           type: string
 *           example: "Updated content of the post"
 *
 *     LikePostRequest:
 *       type: object
 *       properties:
 *
 *     DeletePostRequest:
 *       type: object
 *       properties:
 *
 *     PostObject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfe"
 *         title:
 *           type: string
 *           example: "My First Post"
 *         content:
 *           type: string
 *           example: "This is the content of the post"
 *         authorId:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfd"
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
 *     PostResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Create post successfully"
 *         data:
 *           $ref: '#/components/schemas/PostObject'
 *
 *     PostListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get all posts successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PostObject'
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
 *     PostErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Create post failed"
 *
 *     PostDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Delete post successfully"
 */

/**
 * @openapi
 * /api/posts:
 *   post:
 *     tags: [Post]
 *     summary: Create a new post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       200:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Validation error or creation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostErrorResponse'
 */

/**
 * @openapi
 * /api/posts:
 *   get:
 *     tags: [Post]
 *     summary: Get all posts (paginated)
 *     description: Get all posts (paginated)
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
 *         name: authorId
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: likes
 *         schema:
 *           type: integer
 *         description: Filter by number of likes
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostListResponse'
 */

/**
 * @openapi
 * /api/posts/{id}:
 *   get:
 *     tags: [Post]
 *     summary: Get a post by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 */

/**
 * @openapi
 * /api/posts/author:
 *   get:
 *     tags: [Post]
 *     summary: Get posts of current user
 *     description: Get posts of current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posts of current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Author ID is required or query failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostErrorResponse'
 */

/**
 * @openapi
 * /api/posts/{id}:
 *   put:
 *     tags: [Post]
 *     summary: Update a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostRequest'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Validation error or update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostErrorResponse'
 */

/**
 * @openapi
 * /api/posts/{id}:
 *   delete:
 *     tags: [Post]
 *     summary: Delete a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeletePostRequest'
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostDeleteResponse'
 *       400:
 *         description: Validation error or deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostErrorResponse'
 */

/**
 * @openapi
 * /api/posts/like/{id}:
 *   put:
 *     tags: [Post]
 *     summary: Like or dislike a post
 *     description: Toggles the like status for a user on a post. If the user has already liked the post, it removes the like (dislike). Otherwise, it adds a like.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LikePostRequest'
 *     responses:
 *       200:
 *         description: Like/Dislike toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Validation error or operation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostErrorResponse'
 */
