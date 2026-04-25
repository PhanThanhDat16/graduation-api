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
 */
