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
 *           enum: [global, contract_chat]
 *           description: Type of chat group
 *         memberId:
 *           type: string
 *           nullable: true
 *           description: Required for contract_chat type (contract ID)
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
 *         full_name:
 *           type: string
 *         avatar:
 *           type: string
 *
 *     ChatGroupListItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         memberId:
 *           type: string
 *           nullable: true
 *         ownerId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [global, contract_chat, guest_support]
 *         disputeId:
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
 *           enum: [member, administrator]
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
 */

/**
 * @openapi
 * /api/chats/groups:
 *   post:
 *     tags: [Chat]
 *     summary: Create a new chat group
 *     description: |
 *       Create a new chat group for multiple users.
 *       For contract_chat type, memberId (contract ID) is required.
 *       Creator is automatically added as administrator.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChatGroupRequest'
 *     responses:
 *       200:
 *         description: Chat group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatGroupResponse'
 *       400:
 *         description: Validation error - invalid type, memberIds, or missing memberId for contract_chat
 *       401:
 *         description: Unauthorized - authentication required
 */

/**
 * @openapi
 * /api/chats/groups:
 *   get:
 *     tags: [Chat]
 *     summary: List all chat groups for authenticated user
 *     description: Retrieves all chat groups that the user is a member of, sorted by last message time
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chat groups
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatGroupListResponse'
 *       401:
 *         description: Unauthorized - authentication required
 */

/**
 * @openapi
 * /api/chats/groups/{groupId}/messages:
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
 * /api/chats/groups/{groupId}/members:
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
