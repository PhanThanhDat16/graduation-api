/**
 * @openapi
 * tags:
 *   - name: AI Internal
 *     description: Internal endpoints for AI service data synchronization
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     AIJobData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "69ddfdc71dfc5f268af74bba"
 *         title:
 *           type: string
 *           example: "SmartFashionAI"
 *         description:
 *           type: string
 *           example: "Looking for a developer to build a modern React website"
 *         skills_required:
 *           type: array
 *           items:
 *             type: string
 *           example: ["react", "nodejs", "typescript"]
 *         budget:
 *           type: number
 *           example: 15000000
 *         category:
 *           type: string
 *           example: "web"
 *         experience_level:
 *           type: string
 *           example: "Any"
 *         duration:
 *           type: string
 *           example: "Flexible"
 *
 *     AIFreelancerData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "69e09985f40095934c3044f8"
 *         name:
 *           type: string
 *           example: "Phạm Văn An"
 *         title:
 *           type: string
 *           example: "freelancer"
 *         bio:
 *           type: string
 *           example: "Experienced web developer specializing in React and Node.js"
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           example: ["React", "Node.js"]
 *         rating:
 *           type: number
 *           example: 4.5
 *         hourly_rate:
 *           type: number
 *           example: 0
 *         projects_completed:
 *           type: number
 *           example: 5
 *         apply_history:
 *           type: array
 *           items:
 *             type: string
 *           example: ["69e5e2f1c71d0a03e0c55c4a", "69e9b2313b5045f6441dde49"]
 *         certifications:
 *           type: array
 *           items:
 *             type: string
 *           example: ["AWS Certified Developer"]
 *
 *     AIMessage:
 *       type: object
 *       properties:
 *         role:
 *           type: string
 *           enum: [user, assistant]
 *           example: "user"
 *         content:
 *           type: string
 *           example: "Hello, I'm looking for a job."
 *         senderName:
 *           type: string
 *           example: "John Doe"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-05-08T10:00:00Z"
 */

/**
 * @openapi
 * /internal/ai/jobs:
 *   get:
 *     tags: [AI Internal]
 *     summary: Get all open projects for AI service
 *     description: Returns a list of projects in the specific format required by the AI agent.
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIJobData'
 *
 * /internal/ai/jobs/{id}:
 *   get:
 *     tags: [AI Internal]
 *     summary: Get a single project by ID for AI service
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIJobData'
 *       404:
 *         description: Job not found
 *
 * /internal/ai/freelancers:
 *   get:
 *     tags: [AI Internal]
 *     summary: Get all active freelancers for AI service
 *     description: Returns a list of freelancers and contractors in the specific format required by the AI agent.
 *     responses:
 *       200:
 *         description: List of freelancers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 freelancers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIFreelancerData'
 *
 * /internal/ai/freelancers/{id}:
 *   get:
 *     tags: [AI Internal]
 *     summary: Get a single freelancer by ID for AI service
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Freelancer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIFreelancerData'
 *       404:
 *         description: Freelancer not found
 *
 * /internal/ai/groups/{groupId}/messages:
 *   get:
 *     tags: [AI Internal]
 *     summary: Get conversation history for AI context
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat group ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of messages to fetch
 *     responses:
 *       200:
 *         description: List of messages for AI context
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groupId:
 *                   type: string
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIMessage'
 *
 *   post:
 *     tags: [AI Internal]
 *     summary: Save an AI-generated message to a group
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Sure, here are some job recommendations for you..."
 *     responses:
 *       200:
 *         description: Message saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     groupId:
 *                       type: string
 *                     content:
 *                       type: string
 *                     senderType:
 *                       type: string
 *                       example: "ai"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 */

