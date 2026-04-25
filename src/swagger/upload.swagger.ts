/**
 * @openapi
 * tags:
 *   - name: Upload
 *     description: File upload endpoints
 */

/**
 * @openapi
 * /api/upload/avatar:
 *   post:
 *     tags: [Upload]
 *     summary: Upload an avatar image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/upload/image:
 *   post:
 *     tags: [Upload]
 *     summary: Upload a single image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/upload/images:
 *   post:
 *     tags: [Upload]
 *     summary: Upload multiple images
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
