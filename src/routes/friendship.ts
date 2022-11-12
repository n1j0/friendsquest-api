import express, { Request, Response } from 'express'
import FriendshipController from '../controller/friendshipController.js'

const router = express.Router()
const friendshipController = new FriendshipController()

/**
 * @openapi
 * /friendships:
 *  get:
 *    summary: Get all friendships of a user
 *    tags:
 *      - Friendship
 *    parameters:
 *      - in: header
 *        name: X-Auth
 *        schema:
 *          type: string
 *          required: true
 *          description: Authorization header
 *      - in: query
 *        name: userId
 *        schema:
 *          type: integer
 *          required: true
 *          description: Numeric ID of the user to get the friendships of
 *          example: 1
 *    responses:
 *      200:
 *        description: Returns all friendships of a user
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *               $ref: '#/components/schemas/ExportFriendship'
 *      403:
 *        description: Forbidden access or invalid token
 *      404:
 *        description: User not found
 */
router.get(
    '/',
    (request: Request, response: Response) => friendshipController.getFriendships(request, response),
)

/**
 * @openapi
 * /friendships:
 *   post:
 *     summary: Create a friendship
 *     tags:
 *       - Friendship
 *     parameters:
 *       - in: header
 *         name: X-Auth
 *         schema:
 *           type: string
 *           required: true
 *           description: Authorization header
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               friendsCode:
 *                 type: string
 *                 required: true
 *                 description: Friends code of the user to create a friendship with
 *                 example: 0rIxc
 *     responses:
 *       200:
 *         description: Returns the created friendship
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExportFriendship'
 *       403:
 *         description: Forbidden access or invalid token
 *       404:
 *         description: User not found
 */
router.post(
    '/',
    (request: Request, response: Response) => friendshipController.createFriendship(request, response),
)

/**
 * @openapi
 * /friendships/{id}:
 *   patch:
 *     summary: Update a friendship
 *     tags:
 *       - Friendship
 *     parameters:
 *       - in: header
 *         name: X-Auth
 *         schema:
 *           type: string
 *           required: true
 *           description: Authorization header
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           required: true
 *           description: Numeric ID of the friendship to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 required: true
 *                 enum: [invited, accepted]
 *                 description: Status of the friendship
 *                 example: accepted
 *     responses:
 *       200:
 *         description: Returns the updated friendship
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Friendship'
 *       403:
 *         description: Forbidden access or invalid token
 *       404:
 *         description: Friendship not found
 */
router.patch(
    '/:id',
    (request: Request, response: Response) => friendshipController.updateFriendship(request, response),
)

/**
 * @openapi
 * /friendships/{id}:
 *   delete:
 *     summary: Delete a friendship
 *     tags:
 *       - Friendship
 *     parameters:
 *       - in: header
 *         name: X-Auth
 *         schema:
 *           type: string
 *           required: true
 *           description: Authorization header
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           required: true
 *           description: Numeric ID of the friendship to delete
 *     responses:
 *       200:
 *         description: Returns message that friendship was deleted
 *       403:
 *         description: Forbidden access or invalid token
 *       404:
 *         description: Friendship not found
 */
router.delete(
    '/:id',
    (request: Request, response: Response) => friendshipController.declineFriendship(request, response),
)

export const friendshipRoutes = router
