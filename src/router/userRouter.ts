import { Request, Response, Router } from 'express'
import { body } from 'express-validator'
import UserController from '../controller/userController.js'
import { UserPostgresRepository } from '../repositories/user/userPostgresRepository.js'
import { AUTH_HEADER_UID } from '../constants/index.js'
import { UserRepositoryInterface } from '../repositories/user/userRepositoryInterface.js'
import { ORM } from '../orm.js'
import { RouterInterface } from './routerInterface.js'
import { UserService } from '../services/userService.js'
import { errorHandler } from '../middlewares/errorHandler.js'
import { AttributeInvalidError } from '../errors/AttributeInvalidError.js'
import { AttributeIsMissingError } from '../errors/AttributeIsMissingError.js'
import { DeletionService } from '../services/deletionService.js'

export class UserRouter implements RouterInterface {
    private readonly router: Router

    private readonly userController: UserController

    constructor(
        router: Router,
        orm: ORM,
        userService: UserService = new UserService(),
        deletionService: DeletionService = new DeletionService(),
        userRepository: UserRepositoryInterface = new UserPostgresRepository(userService, deletionService, orm),
        userController: UserController = new UserController(userRepository),
    ) {
        this.router = router
        this.userController = userController
    }

    getAllUsersHandler = (_request: Request, response: Response) => this.userController.getAllUsers(response)

    generateAllUsersRoute = () => {
        /**
         * @openapi
         * /users:
         *   get:
         *     summary: Returns all users
         *     tags:
         *       - User
         *     responses:
         *       200:
         *         description: Returns persons
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   type: array
         *                   items:
         *                     $ref: '#/components/schemas/User'
         *                 points:
         *                   type: object
         *                   default: {}
         *       403:
         *         $ref: '#/components/responses/Forbidden'
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
         *               type: object
         *               properties:
         *                 data:
         *                   $ref: '#/components/schemas/User'
         *                 points:
         *                   type: object
         *                   default: {}
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         *       404:
         *         $ref: '#/components/responses/NotFound'
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
         *               type: object
         *               properties:
         *                 data:
         *                   $ref: '#/components/schemas/User'
         *                 points:
         *                   type: object
         *                   default: {}
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         *       404:
         *         $ref: '#/components/responses/NotFound'
         */
        this.router.get('/uid/:uid', this.getUserByUidHandler)
    }

    getUserByFriendsCodeHandler = (request: Request, response: Response) => this.userController.getUserByFriendsCode(
        { fc: request.params.fc },
        response,
    )

    generateGetUserByFriendsCodeRoute = () => {
        /**
         * @openapi
         * /users/fc/{fc}:
         *   get:
         *     summary: Get a user by friends code
         *     tags:
         *       - User
         *     parameters:
         *       - in: path
         *         name: fc
         *         schema:
         *           type: string
         *         required: true
         *         description: Friends code of the user to get
         *     responses:
         *       200:
         *         description: Returns a user by friends code
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   $ref: '#/components/schemas/User'
         *                 points:
         *                   type: object
         *                   default: {}
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         *       404:
         *         $ref: '#/components/responses/NotFound'
         */
        this.router.get('/fc/:fc', this.getUserByFriendsCodeHandler)
    }

    createUserHandler = (request: Request, response: Response) => this.userController.createUser(
        {
            email: request.body.email,
            username: request.body.username,
            uid: request.headers[String(AUTH_HEADER_UID)] as string,
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
         *               username:
         *                 type: string
         *                 description: The username of the user
         *             required:
         *               - email
         *               - username
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
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   $ref: '#/components/schemas/User'
         *                 points:
         *                   type: object
         *                   default: {}
         *       400:
         *         $ref: '#/components/responses/BadRequest'
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         */
        this.router.post(
            '/',
            [
                body('email')
                    .notEmpty()
                    .withMessage(
                        {
                            message: 'Email is required',
                            type: AttributeIsMissingError,
                        },
                    )
                    .isEmail()
                    .withMessage(
                        {
                            message: 'Email is invalid',
                            type: AttributeInvalidError,
                        },
                    )
                    .trim(),
                body('username')
                    .notEmpty()
                    .withMessage(
                        {
                            message: 'Username is required',
                            type: AttributeIsMissingError,
                        },
                    )
                    .isString()
                    .withMessage(
                        {
                            message: 'Username must be a string',
                            type: AttributeInvalidError,
                        },
                    )
                    .trim(),
            ],
            errorHandler,
            this.createUserHandler,
        )
    }

    updateUserHandler = (request: Request, response: Response) => this.userController.updateUser(
        {
            email: request.body.email,
            username: request.body.username,
            body: request.body,
            uid: request.headers[String(AUTH_HEADER_UID)] as string,
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
         *               username:
         *                 type: string
         *                 description: The username of the user
         *             required:
         *               - email
         *               - username
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
         *               type: object
         *               properties:
         *                 data:
         *                   $ref: '#/components/schemas/User'
         *                 points:
         *                   $ref: '#/components/schemas/Points'
         *       400:
         *         $ref: '#/components/responses/BadRequest'
         *       404:
         *         $ref: '#/components/responses/NotFound'
         */
        this.router.patch(
            '/',
            [
                body('email')
                    .isEmail()
                    .withMessage(
                        {
                            message: 'Email is invalid',
                            type: AttributeInvalidError,
                        },
                    )
                    .trim(),
                body('username')
                    .isString()
                    .withMessage(
                        {
                            message: 'Username must be a string',
                            type: AttributeInvalidError,
                        },
                    )
                    .trim(),
            ],
            errorHandler,
            this.updateUserHandler,
        )
    }

    deleteUserHandler = (request: Request, response: Response) => this.userController.deleteUser(
        { uid: request.headers[String(AUTH_HEADER_UID)] as string },
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
         *     responses:
         *       204:
         *         description: Ok
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         *       404:
         *         $ref: '#/components/responses/NotFound'
         */
        this.router.delete('/', this.deleteUserHandler)
    }

    createAndReturnRoutes = () => {
        this.generateAllUsersRoute()
        this.generateGetUserByIdRoute()
        this.generateGetUserByUidRoute()
        this.generateGetUserByFriendsCodeRoute()
        this.generateCreateUserRoute()
        this.generateUpdateUserRoute()
        this.generateDeleteUserRoute()

        return this.router
    }
}
