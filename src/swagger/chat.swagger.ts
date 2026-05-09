/**
 * @openapi
 * tags:
 *   - name: Chat
 *     description: Chat group management and messaging endpoints (authenticated users only)
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateChatGroupRequest:
 *       type: object
 *       required: [type, memberIds]
 *       properties:
 *         type:
 *           type: string
 *           enum: [contract_chat, dispute, guest_support, user_support, ai_chat]
 *           description: Type of chat group
 *         disputeId:
 *           type: string
 *           nullable: true
 *           description: Dispute ID if chat is related to a dispute
 *         memberIds:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs to add to the group
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *
 *     PublicChatUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         fullName:
 *           type: string
 *         avatar:
 *           type: string
 *
 *     ChatGroupListItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         memberIds:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs in this group
 *           example: ["507f1f77bcf86cd799439011"]
 *         ownerId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [contract_chat, dispute, guest_support, user_support, ai_chat]
 *         disputeId:
 *           type: string
 *           nullable: true
 *         assignedStaffId:
 *           type: string
 *           nullable: true
 *         lastMessage:
 *           type: string
 *         lastMessageAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         lastSenderId:
 *           $ref: '#/components/schemas/PublicChatUser'
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         unreadCount:
 *           type: integer
 *
 *     ChatGroupListResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatGroupListItem'
 *
 *     ChatGroupResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/ChatGroupListItem'
 *
 *     ReplyPreview:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         senderId:
 *           $ref: '#/components/schemas/PublicChatUser'
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         groupId:
 *           type: string
 *         senderId:
 *           $ref: '#/components/schemas/PublicChatUser'
 *           nullable: true
 *         type:
 *           type: string
 *           enum: [text, image, file, system]
 *         content:
 *           type: string
 *         replyTo:
 *           $ref: '#/components/schemas/ReplyPreview'
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     MessagesPaginatedResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     GroupMember:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         role:
 *           type: string
 *           enum: [member, owner]
 *         joinedAt:
 *           type: string
 *           format: date-time
 *
 *     GroupMembersResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GroupMember'
 *
 *     SaveMessageRequest:
 *       type: object
 *       required: [content]
 *       properties:
 *         content:
 *           type: string
 *           description: The content of the message
 *         userId:
 *           type: string
 *           nullable: true
 *           description: User ID for authenticated users
 *         guestName:
 *           type: string
 *           nullable: true
 *           description: Guest name for guest users
 *         senderType:
 *           type: string
 *           description: Type of sender (user, staff, guest)
 *           example: user
 *         type:
 *           type: string
 *           description: Message type (text, image, file, system)
 *           default: text
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Message'
 */

/**
 * @openapi
 * /api/chat/groups/{groupId}/messages:
 *   post:
 *     tags: [Chat]
 *     summary: Create a new message in chat group
 *     description: Saves a new message to a chat group. Works for both guest and authenticated users.
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
 *             $ref: '#/components/schemas/SaveMessageRequest'
 *     responses:
 *       200:
 *         description: Message created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Validation error - content required or invalid groupId
 *       404:
 *         description: Chat group not found
 */

/**
 * @openapi
 * /api/chat/groups/{groupId}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Get messages in a chat group (paginated)
 *     description: Retrieves messages from a specific chat group with pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat group ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (1-indexed)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Messages per page (max 100)
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessagesPaginatedResponse'
 *       400:
 *         description: Invalid groupId
 *       401:
 *         description: Unauthorized - authentication required
 */

/**
 * @openapi
 * /api/chat/groups/{groupId}/messages/guest:
 *   get:
 *     tags: [Chat]
 *     summary: Get guest messages in a chat group
 *     description: Retrieves messages from a specific chat group for guest users
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat group ID
 *     responses:
 *       200:
 *         description: Guest messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessagesPaginatedResponse'
 *       400:
 *         description: Invalid groupId
 *       404:
 *         description: Chat group not found
 */

/**
 * @openapi
 * /api/chat/groups/{groupId}/members:
 *   get:
 *     tags: [Chat]
 *     summary: Get members of a chat group
 *     description: Retrieves all members in a specific chat group with their roles
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat group ID
 *     responses:
 *       200:
 *         description: Group members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupMembersResponse'
 *       400:
 *         description: Invalid groupId or user is not a member
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - user is not a member of this group
 */
