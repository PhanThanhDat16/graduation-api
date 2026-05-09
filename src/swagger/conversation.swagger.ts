/**
 * @openapi
 * tags:
 *   - name: Conversation
 *     description: Guest and user conversation management endpoints
 */

/**
 * @openapi
 * components:
 *   schemas:
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
 *     ConversationResponse:
 *       type: object
 *       properties:
 *         groupId:
 *           type: string
 *         userId:
 *           type: string
 *           nullable: true
 *         guestName:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     CreateGuestConversationRequest:
 *       type: object
 *       required: [guestName]
 *       properties:
 *         guestName:
 *           type: string
 *           example: "John Doe"
 *
 *     SaveMessageRequest:
 *       type: object
 *       required: [content]
 *       properties:
 *         content:
 *           type: string
 *           example: "Hello, this is my message"
 *         userId:
 *           type: string
 *           nullable: true
 *           description: Required for authenticated users
 *           example: "507f1f77bcf86cd799439011"
 *         guestName:
 *           type: string
 *           nullable: true
 *           description: Required for guest users
 *           example: "John Doe"
 *         type:
 *           type: string
 *           enum: [text, image, file, system]
 *           default: text
 *
 *     MessageWithRelations:
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
 *           type: object
 *           nullable: true
 *           properties:
 *             _id:
 *               type: string
 *             content:
 *               type: string
 *             senderId:
 *               $ref: '#/components/schemas/PublicChatUser'
 *               nullable: true
 *             createdAt:
 *               type: string
 *               format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/MessageWithRelations'
 *
 *     ConversationDataResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/ConversationResponse'
 *
 *     MergeGuestConversationRequest:
 *       type: object
 *       required: [guestUserId]
 *       properties:
 *         guestUserId:
 *           type: string
 *           description: The ID of the temporary guest user created during conversation
 *           example: "507f1f77bcf86cd799439011"
 *
 *     ReassignStaffConversationsRequest:
 *       type: object
 *       required: [fromStaffId, toStaffId]
 *       properties:
 *         fromStaffId:
 *           type: string
 *           description: The ID of the current assigned staff
 *           example: "60d0fe4f5311236168a109ca"
 *         toStaffId:
 *           type: string
 *           description: The ID of the new staff to assign conversations to
 *           example: "60d0fe4f5311236168a109cb"
 */

/**
 * @openapi
 * /api/conversations/guest:
 *   post:
 *     tags: [Conversation]
 *     summary: Create a new guest conversation
 *     description: Creates a new conversation for a guest without requiring authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGuestConversationRequest'
 *     responses:
 *       200:
 *         description: Guest conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationDataResponse'
 *       400:
 *         description: Validation error - guestName is required
 */

/**
 * @openapi
 * /api/conversations/groups:
 *   post:
 *     tags: [Conversation]
 *     summary: Create a new conversation group
 *     description: Creates a new conversation group with specified members. Requires authentication.
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
 *         description: Conversation group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationDataResponse'
 *       400:
 *         description: Validation error - invalid type or memberIds
 *       401:
 *         description: Unauthorized - authentication required
 */

/**
 * @openapi
 * /api/conversations/groups:
 *   get:
 *     tags: [Conversation]
 *     summary: List all conversation groups for authenticated user
 *     description: Retrieves all conversation groups that the user is a member of
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversation groups
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatGroupListResponse'
 *       401:
 *         description: Unauthorized - authentication required
 */

/**
 * @openapi
 * /api/conversations/merge:
 *   post:
 *     tags: [Conversation]
 *     summary: Merge guest conversation to user account
 *     description: |
 *       Transfers a guest conversation to an authenticated user account.
 *       Requires authentication. All messages from the guest will be attributed to the new user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MergeGuestConversationRequest'
 *     responses:
 *       200:
 *         description: Conversation merged successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationDataResponse'
 *       400:
 *         description: Validation error or conversation not found
 *       401:
 *         description: Unauthorized - authentication required
 */

/**
 * @openapi
 * /api/conversations/guest:
 *   get:
 *     tags: [Conversation]
 *     summary: Get conversation by userId or groupId
 *     description: Retrieves a guest or user conversation. Query either userId or groupId
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID to find conversation
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: Group ID to find conversation
 *     responses:
 *       200:
 *         description: Conversation found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationDataResponse'
 *       400:
 *         description: Validation error - userId or groupId required
 *       404:
 *         description: Conversation not found
 */

/**
 * @openapi
 * /api/conversations/{groupId}:
 *   get:
 *     tags: [Conversation]
 *     summary: Get conversation by ID
 *     description: Retrieves a specific conversation by its group ID
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation group ID
 *     responses:
 *       200:
 *         description: Conversation found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConversationDataResponse'
 *       400:
 *         description: Validation error - groupId is required
 *       404:
 *         description: Conversation not found
 */
 
/**
 * @openapi
 * /api/conversations/reassign:
 *   post:
 *     tags: [Conversation]
 *     summary: Reassign all conversations from one staff to another (Admin only)
 *     description: |
 *       Finds all support conversations assigned to one staff and reassigns them to another staff.
 *       Updates assignedStaffId, memberIds, and ChatMember records.
 *       Requires Admin role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReassignStaffConversationsRequest'
 *     responses:
 *       200:
 *         description: Conversations reassigned successfully
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
 *                     reassignedCount:
 *                       type: number
 *       400:
 *         description: Validation error - fromStaffId and toStaffId are required
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - only admins can access this endpoint
 */
 
/**
 * @openapi
 * /api/conversations/all:
 *   get:
 *     tags: [Conversation]
 *     summary: List all conversations with optional type filter (Staff/Admin only)
 *     description: |
 *       Returns all conversations in the system, optionally filtered by type.
 *       Includes populated owner info, assigned staff info, and last sender info.
 *       Requires Staff or Admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [guest_support, user_support, contract_chat, dispute, ai_chat]
 *         description: Filter conversations by type (optional, returns all if omitted)
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       memberIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                       ownerId:
 *                         type: string
 *                         nullable: true
 *                       ownerInfo:
 *                         $ref: '#/components/schemas/PublicChatUser'
 *                         nullable: true
 *                       type:
 *                         type: string
 *                         enum: [guest_support, user_support, contract_chat, dispute, ai_chat]
 *                       disputeId:
 *                         type: string
 *                         nullable: true
 *                       assignedStaffId:
 *                         type: string
 *                         nullable: true
 *                       assignedStaffInfo:
 *                         $ref: '#/components/schemas/PublicChatUser'
 *                         nullable: true
 *                       guestName:
 *                         type: string
 *                         nullable: true
 *                       lastMessage:
 *                         type: string
 *                       lastMessageAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       lastSenderId:
 *                         $ref: '#/components/schemas/PublicChatUser'
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - only staff and admin can access this endpoint
 */
