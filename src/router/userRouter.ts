import { Request, Response, Router } from 'express'
import UserController from '../controller/userController.js'
import { UserPostgresRepository } from '../repositories/user/userPostgresRepository.js'
import { AUTH_HEADER_UID } from '../constants/index.js'
import { UserRepositoryInterface } from '../repositories/user/userRepositoryInterface.js'
import { ORM } from '../orm.js'
import { RouterInterface } from './routerInterface.js'
import { UserService } from '../services/userService.js'

export class UserRouter implements RouterInterface {
    private readonly router: Router

    private readonly userService: UserService

    private readonly userRepository: UserRepositoryInterface

    private readonly userController: UserController

    constructor(
        router: Router,
        orm: ORM,
        userService: UserService = new UserService(),
        userRepository: UserRepositoryInterface = new UserPostgresRepository(userService, orm),
        userController: UserController = new UserController(userRepository),
    ) {
        this.router = router
        this.userService = userService
        this.userRepository = userRepository
        this.userController = userController
    }

    getAllUsersHandler = (_request: Request, response: Response) => this.userController.getAllUsers(response)

    generateAllUsersHandlerRoute = () => {
        /**
         * @openapi
         * /users:
         *   get:
         *     summary: Returns all users
         *     tags:
         *       - User
         *     parameters:
         *       - in: header
         *         name: X-Auth
         *         schema:
         *           type: string
         *         required: true
         *         description: Authorization header
         *     responses:
         *       200:
         *         description: Returns persons
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 $ref: '#/components/schemas/User'
         *       403:
         *         description: Forbidden access or invalid token
         */
        this.router.get('/', this.getAllUsersHandler)
    }

    getUserByIdHandler = (request: Request, response: Response) => this.userController.getUserById(
        { id: request.params.id },
        response,
    )

    generateGetUserByIdRoute = () => {
        /**
         * @openapi
         * /users/{id}:
         *   get:
         *     summary: Get a user by id
         *     tags:
         *       - User
         *     parameters:
         *       - in: header
         *         name: X-Auth
         *         schema:
         *           type: string
         *         required: true
         *         description: Authorization header
         *       - in: path
         *         name: id
         *         schema:
         *           type: string
         *         required: true
         *         description: Numeric ID of the user to get
         *     responses:
         *       200:
         *         description: Returns a user by id
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/User'
         *       403:
         *         description: Forbidden access or invalid token
         *       404:
         *         description: User not found
         */
        this.router.get('/:id', this.getUserByIdHandler)
    }

    getUserByUidHandler = (request: Request, response: Response) => this.userController.getUserByUid(
        { uid: request.params.uid },
        response,
    )

    generateGetUserByUidRoute = () => {
        /**
         * @openapi
         * /users/uid/{uid}:
         *   get:
         *     summary: Get a user by uid
         *     tags:
         *       - User
         *     parameters:
         *       - in: header
         *         name: X-Auth
         *         schema:
         *           type: string
         *         required: true
         *         description: Authorization header
         *       - in: path
         *         name: uid
         *         schema:
         *           type: string
         *         required: true
         *         description: Numeric UID of the user to get
         *     responses:
         *       200:
         *         description: Returns a user by uid
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/User'
         *       403:
         *         description: Forbidden access or invalid token
         *       404:
         *         description: User not found
         */
        this.router.get('/uid/:uid', this.getUserByUidHandler)
    }

    createUserHandler = (request: Request, response: Response) => this.userController.createUser(
        {
            email: request.body.email,
            username: request.body.username,
            uid: request.headers[AUTH_HEADER_UID] as string,
        },
        response,
    )

    generateCreateUserRoute = () => {
        /**
         * @openapi
         * /users:
         *   post:
         *     summary: Create a new user
         *     tags:
         *       - User
         *     parameters:
         *       - in: header
         *         name: X-Auth
         *         schema:
         *           type: string
         *         required: true
         *         description: Authorization header
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               email:
         *                 type: string
         *                 description: The email of the user
         *                 required: true
         *               username:
         *                 type: string
         *                 description: The username of the user
         *                 required: true
         *           examples:
         *             normal:
         *               summary: Example for valid creation of user
         *               value:
         *                 email: Jon@Doe.abc
         *                 username: JonDoe
         *             error:
         *               summary: Example for invalid creation of user
         *               value:
         *                 firstName: Jon
         *                 lastName: Doe
         *     responses:
         *       201:
         *         description: Returns the created user
         *       400:
         *         description: Username or email already exists
         *       403:
         *         description: Forbidden access or invalid token
         */
        this.router.post('/', this.createUserHandler)
    }

    updateUserHandler = (request: Request, response: Response) => this.userController.updateUser(
        {
            email: request.body.email,
            username: request.body.username,
            body: request.body,
            uid: request.headers[AUTH_HEADER_UID] as string,
        },
        response,
    )

    generateUpdateUserRoute = () => {
        /**
         * @openapi
         * /users:
         *   patch:
         *     summary: Update a user
         *     tags:
         *       - User
         *     parameters:
         *       - in: header
         *         name: X-Auth
         *         schema:
         *           type: string
         *         required: true
         *         description: Authorization header
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               email:
         *                 type: string
         *                 description: The email of the user
         *                 required: true
         *               username:
         *                 type: string
         *                 description: The username of the user
         *                 required: false
         *           examples:
         *             normal:
         *               summary: Example for valid change of one user
         *               value:
         *                 email: Jon@Doe.abc
         *                 username: JonDoe
         *             error:
         *               summary: Example for invalid change of one user
         *               value:
         *                 username: kevin
         *     responses:
         *       200:
         *         description: Returns the updated user
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/User'
         *       400:
         *         description: Email or Username already taken
         *       404:
         *         description: User not found
         */
        this.router.patch(
            '/',
            this.updateUserHandler,
        )
    }

    deleteUserHandler = (request: Request, response: Response) => this.userController.deleteUser(
        { uid: request.headers[AUTH_HEADER_UID] as string },
        response,
    )

    generateDeleteUserRoute = () => {
        /**
         * @openapi
         * /users:
         *   delete:
         *     summary: Delete a user
         *     tags:
         *       - User
         *     parameters:
         *       - in: header
         *         name: X-Auth
         *         schema:
         *           type: string
         *         required: true
         *         description: Authorization header
         *     responses:
         *       204:
         *         description: Returns the deleted user
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               ref: '#/components/schemas/User'
         *       403:
         *         description: Forbidden access or invalid token
         *       404:
         *         description: User not found
         */
        this.router.delete(
            '/',
            this.deleteUserHandler,
        )
    }

    createAndReturnRoutes = () => {
        this.generateAllUsersHandlerRoute()
        this.generateGetUserByIdRoute()
        this.generateGetUserByUidRoute()
        this.generateCreateUserRoute()
        this.generateUpdateUserRoute()
        this.generateDeleteUserRoute()

        return this.router
    }
}
