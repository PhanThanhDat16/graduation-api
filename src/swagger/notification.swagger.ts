/**
 * @openapi
 * tags:
 *   - name: Notification
 *     description: Notification management endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateNotificationRequest:
 *       type: object
 *       required: [userId, type, title, content]
 *       properties:
 *         userId:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfd"
 *         type:
 *           type: string
 *           enum:
 *             - contract_created
 *             - contract_agreed
 *             - contract_paid
 *             - contract_submitted
 *             - contract_completed
 *             - contract_cancelled
 *             - contract_extended
 *             - dispute_opened
 *             - dispute_resolved
 *             - dispute_closed
 *             - payment_received
 *             - payment_refunded
 *             - wallet_deposit
 *             - wallet_withdraw
 *             - review_received
 *             - system
 *             - other
 *           example: "contract_created"
 *         title:
 *           type: string
 *           example: "New Contract Created"
 *         content:
 *           type: string
 *           example: "A new contract has been created for your project."
 *
 *     CreateManyNotificationsRequest:
 *       type: object
 *       required: [notifications]
 *       properties:
 *         notifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *
 *     NotificationObject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734ad01"
 *         userId:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734acfd"
 *         type:
 *           type: string
 *           example: "contract_created"
 *         title:
 *           type: string
 *           example: "New Contract Created"
 *         content:
 *           type: string
 *           example: "A new contract has been created for your project."
 *         isRead:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     NotificationPopulatedObject:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "60a7b2f7c6e9fa001734ad01"
 *         userId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "60a7b2f7c6e9fa001734acfd"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               example: "john@example.com"
 *             avatar:
 *               type: string
 *               example: "https://example.com/avatar.jpg"
 *         type:
 *           type: string
 *           example: "contract_created"
 *         title:
 *           type: string
 *           example: "New Contract Created"
 *         content:
 *           type: string
 *           example: "A new contract has been created for your project."
 *         isRead:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     NotificationResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get notification successfully"
 *         data:
 *           $ref: '#/components/schemas/NotificationPopulatedObject'
 *
 *     NotificationListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get all notifications successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NotificationObject'
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
 *     UnreadCountResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Get unread count successfully"
 *         data:
 *           type: object
 *           properties:
 *             unreadCount:
 *               type: number
 *               example: 3
 *
 *     MarkAllReadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Mark all as read successfully"
 *         data:
 *           type: object
 *           properties:
 *             modifiedCount:
 *               type: number
 *               example: 5
 *
 *     DeleteAllResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Delete all notifications successfully"
 *         data:
 *           type: object
 *           properties:
 *             deletedCount:
 *               type: number
 *               example: 10
 *
 *     NotificationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Create notification failed"
 *
 *     NotificationDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Notification deleted successfully"
 */

/**
 * @openapi
 * /api/notifications/me:
 *   get:
 *     tags: [Notification]
 *     summary: Get current user's notifications
 *     description: Retrieve all notifications for the authenticated user with pagination, sorted by newest first by default.
 *     security:
 *       - bearerAuth: []
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
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status (true/false)
 *     responses:
 *       200:
 *         description: User's notifications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
 *       400:
 *         description: User ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationErrorResponse'
 */

/**
 * @openapi
 * /api/notifications/me/unread-count:
 *   get:
 *     tags: [Notification]
 *     summary: Get unread notification count
 *     description: Returns the number of unread notifications for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnreadCountResponse'
 *       400:
 *         description: User ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationErrorResponse'
 */

/**
 * @openapi
 * /api/notifications/me/read-all:
 *   put:
 *     tags: [Notification]
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications for the authenticated user as read.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarkAllReadResponse'
 *       400:
 *         description: User ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationErrorResponse'
 */

/**
 * @openapi
 * /api/notifications/me/all:
 *   delete:
 *     tags: [Notification]
 *     summary: Delete all my notifications
 *     description: Deletes all notifications for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteAllResponse'
 *       400:
 *         description: User ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationErrorResponse'
 */

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   put:
 *     tags: [Notification]
 *     summary: Mark a notification as read
 *     description: Marks a single notification as read. Only the owner can mark their notification.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       400:
 *         description: Validation error or not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationErrorResponse'
 */

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notification]
 *     summary: Delete a notification
 *     description: Deletes a single notification by its ID. Only the owner can delete their notification.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationDeleteResponse'
 *       400:
 *         description: Validation error, not authorized, or deletion failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationErrorResponse'
 */

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     tags: [Notification]
 *     summary: Get all notifications (admin)
 *     description: Retrieve all notifications with pagination and filters. Intended for admin use.
 *     security:
 *       - bearerAuth: []
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
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *     responses:
 *       200:
 *         description: List of all notifications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
 */

/**
 * @openapi
 * /api/notifications/{id}:
 *   get:
 *     tags: [Notification]
 *     summary: Get notification by ID
 *     description: Retrieve a single notification by its ID with populated user reference.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
 *       400:
 *         description: Invalid ID or not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationErrorResponse'
 */

/**
 * @openapi
 * /api/notifications:
 *   post:
 *     tags: [Notification]
 *     summary: Create a notification (admin)
 *     description: Create a single notification for a specific user. Intended for admin or system use.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       200:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Create notification successfully"
 *                 data:
 *                   $ref: '#/components/schemas/NotificationObject'
 *       400:
 *         description: Validation error or creation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationErrorResponse'
 */

/**
 * @openapi
 * /api/notifications/bulk:
 *   post:
 *     tags: [Notification]
 *     summary: Create multiple notifications (admin)
 *     description: Create multiple notifications at once. Intended for admin or system use (e.g. broadcasting notifications).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateManyNotificationsRequest'
 *     responses:
 *       200:
 *         description: Notifications created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Create notifications successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificationObject'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationErrorResponse'
 */
