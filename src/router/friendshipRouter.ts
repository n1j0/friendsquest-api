import { Request, Response, Router } from 'express'
import FriendshipController from '../controller/friendshipController.js'
import { FriendshipPostgresRepository } from '../repositories/friendship/friendshipPostgresRepository.js'
import { UserPostgresRepository } from '../repositories/user/userPostgresRepository.js'
import { AUTH_HEADER_UID } from '../constants/index.js'
import { FriendshipRepositoryInterface } from '../repositories/friendship/friendshipRepositoryInterface.js'
import { UserRepositoryInterface } from '../repositories/user/userRepositoryInterface.js'
import { ORM } from '../orm.js'
import { RouterInterface } from './routerInterface.js'
import { UserService } from '../services/userService.js'

export class FriendshipRouter implements RouterInterface {
    private readonly router: Router

    private readonly friendshipController: FriendshipController

    constructor(
        router: Router,
        orm: ORM,
        userService: UserService = new UserService(),
        userRepository: UserRepositoryInterface = new UserPostgresRepository(userService, orm),
        friendshipRepository: FriendshipRepositoryInterface = new FriendshipPostgresRepository(userRepository, orm),
        friendshipController: FriendshipController = new FriendshipController(friendshipRepository, userRepository),
    ) {
        this.router = router
        this.friendshipController = friendshipController
    }

    getFriendshipsHandler = (request: Request, response: Response) => this.friendshipController.getFriendshipsByUid(
        { userId: String(request.query.userId) },
        response,
    )

    generateGetAllFriendshipsRoute = () => {
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
         *        $ref: '#/components/responses/Forbidden'
         *      404:
         *        $ref: '#/components/responses/NotFound'
         */
        this.router.get('/', this.getFriendshipsHandler)
    }

    createFriendshipHandler = (request: Request, response: Response) => this.friendshipController.createFriendship(
        { friendsCode: request.body.friendsCode, uid: request.headers[AUTH_HEADER_UID] as string },
        response,
    )

    generateCreateFriendshipRoute = () => {
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
         *         $ref: '#/components/responses/Forbidden'
         *       404:
         *         $ref: '#/components/responses/NotFound'
         */
        this.router.post('/', this.createFriendshipHandler)
    }

    acceptFriendshipHandler = (request: Request, response: Response) => this.friendshipController.acceptFriendship(
        {
            id: request.params.id,
            uid: request.headers[AUTH_HEADER_UID] as string,
        },
        response,
    )

    generateAcceptFriendshipRoute = () => {
        /**
         * @openapi
         * /friendships/{id}:
         *   patch:
         *     summary: Accept a friendship
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
         *           description: Numeric ID of the friendship to accept
         *     responses:
         *       200:
         *         description: Returns the accepted friendship
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Friendship'
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         *       404:
         *         $ref: '#/components/responses/NotFound'
         */
        this.router.patch('/:id', this.acceptFriendshipHandler)
    }

    declineOrDeleteFriendshipHandler = (
        request: Request,
        response: Response,
    ) => this.friendshipController.declineOrDeleteFriendship(
        {
            id: request.params.id,
            uid: request.headers[AUTH_HEADER_UID] as string,
        },
        response,
    )

    generateDeclineOrDeleteFriendshipRoute = () => {
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
         *       204:
         *         description: Ok
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         *       404:
         *         $ref: '#/components/responses/NotFound'
         */
        this.router.delete('/:id', this.declineOrDeleteFriendshipHandler)
    }

    createAndReturnRoutes = () => {
        this.generateGetAllFriendshipsRoute()
        this.generateCreateFriendshipRoute()
        this.generateAcceptFriendshipRoute()
        this.generateDeclineOrDeleteFriendshipRoute()

        return this.router
    }
}
