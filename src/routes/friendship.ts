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
 *                 example: 5x7xu
 *     responses:
 *       200:
 *         description: Returns the created friendship
 *       403:
 *         description: Forbidden access or invalid token
 *       404:
 *         description: User not found
 */
router.post(
    '/',
    (request: Request, response: Response) => friendshipController.createFriendship(request, response),
)

export const friendshipRoutes = router
