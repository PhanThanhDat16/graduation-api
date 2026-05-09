/**
 * @openapi
 * tags:
 *   - name: Dashboard
 *     description: Dashboard and statistics endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     TimeseriesBucket:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *           description: Human readable label for the period (e.g., "DD/MM", "MM/YYYY", "YYYY")
 *         sortKey:
 *           type: string
 *           description: Key for sorting (e.g., "YYYY-MM-DD", "YYYY-MM", "YYYY")
 *         contracts:
 *           type: number
 *           description: Number of new contracts in this period
 *         completedProjects:
 *           type: number
 *           description: Number of projects completed in this period
 *         disputes:
 *           type: number
 *           description: Number of dispute cases opened in this period
 *         revenueVnd:
 *           type: number
 *           description: Revenue from admin fees in this period (VND)
 *     DashboardSummary:
 *       type: object
 *       properties:
 *         totalContracts:
 *           type: number
 *         completedProjects:
 *           type: number
 *         disputeCases:
 *           type: number
 *         revenueVnd:
 *           type: number
 *     DashboardData:
 *       type: object
 *       properties:
 *         buckets:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TimeseriesBucket'
 *         summary:
 *           $ref: '#/components/schemas/DashboardSummary'
 *     DashboardResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/DashboardData'
 */

/**
 * @openapi
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics (Admin/Staff)
 *     description: Aggregates real data from contracts, disputes, and transactions into time-series buckets and summary.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date (ISO format)
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date (ISO format)
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [day, month, year]
 *           default: month
 *         description: Time bucket granularity
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardResponse'
 *       400:
 *         description: Bad Request - Missing or invalid parameters
 *       401:
 *         description: Unauthorized
 */
