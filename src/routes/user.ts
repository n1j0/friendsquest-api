import express, { Request, Response } from 'express'
import { wrap } from '@mikro-orm/core'
import UserController from '../controller/userController.js'
import { userPermissionMiddleware } from '../middlewares/userPermission.js'
import { User } from '../entities/user.js'
import { $app } from '../$app.js'

const router = express.Router()
const userController = new UserController()

// TODO better openapi documentation
// TODO test with swagger
// TODO create tests

// TODO create UserNotFoundError

const userNotFoundError = (response: Response) => {
    response.status(404).send({
        message: 'User not found',
    })
}

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
router.get(
    '/',
    (_request: Request, response: Response) => userController.getAllUsers(response),
)

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
router.get(
    '/:id',
    (request: Request, response: Response) => userController.getUserById(request, response),
)

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
router.get(
    '/uid/:uid',
    (request: Request, response: Response) => userController.getUserByUid(request, response),
)

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
router.post(
    '/',
    (request: Request, response: Response) => userController.createUser(request, response),
)

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Update a user by uid
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
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to update
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
router.patch(
    '/:id',
    userPermissionMiddleware((uid: string, request: Request) => userController.isAllowedToEditUser(uid, request)),
    (request: Request, response: Response) => userController.updateUser(request, response),
)

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by uid
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
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to delete
 *     responses:
 *       204:
 *         description: Returns the deleted user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.delete(
    '/:id',
    userPermissionMiddleware((uid: string, request: Request) => userController.isAllowedToEditUser(uid, request)),
    (request: Request, response: Response) => userController.deleteUser(request, response),
)

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     description: Get a user by uid
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the user to get
 *     responses:
 *       200:
 *         description: Returns a user by uid
 */
router.get(
    '/:id',
    async (request: Request, response: Response) => {
        // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/40584
        const user = await $app.userRepository.findOne({ id: request.params.id } as any)
        if (user) {
            console.log(user)
            return response.status(200).json(user)
        }
        return response.status(404).json({ message: 'User not found' })
    },
)

/**
 * @openapi
 * /users:
 *   post:
 *     description: Create a new user
 *     requestBody:
 *       content:
 *         application/json:
 *         schema:
 *         type: object
 *         properties:
 *           email:
 *           type: string
 *           example:
 *             email: 'maxmuster@muster.com'
 *             required: true
 *             description: The email of the user
 *     responses:
 *       201:
 *         description: Returns the created user
 *       400:
 *         description: Returns an error if the user could not be created
 */
router.post(
    '/',
    async (request: Request, response: Response) => {
        if (!request.body.email) {
            return response.status(400).json({ message: 'Email is missing' })
        }
        try {
            // TODO (markus): add openAPI spec
            const user = new User(request.body.email, request.body.uid, request.body.username)
            // TODO change to persist
            await $app.userRepository.persistAndFlush(user)
            return response.status(201).json(user)
        } catch (error: any) {
            return response.status(400).json({ message: error.message })
        }
    },
)

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     description: Update a user by uid
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the user to update
 *     responses:
 *       200:
 *         description: Returns the updated user
 *       404:
 *         description: User not found
 */
router.patch(
    '/:id',
    async (request: Request, response: Response) => {
        try {
            const user = await $app.userRepository.findOneOrFail(request.params.id as any)
            wrap(user).assign(request.body)
            // TODO check documentation flush/persist
            await $app.userRepository.flush()

            return response.status(200).json(user)
        } catch {
            return userNotFoundError(response)
        }
    },
)

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     description: Delete a user by uid
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the user to delete
 *     responses:
 *       200:
 *         description: Returns the deleted user
 *       404:
 *         description: User not found
 */
router.delete(
    '/:id',
    async (request: Request, response: Response) => {
        // TODO check error for undefined
        const user = await $app.userRepository.findOne({ id: request.params.id } as any)
        if (user) {
            await $app.userRepository.removeAndFlush(user)
            return response.status(204).json()
        }
        return userNotFoundError(response)
    },
)

export const usersRoutes = router
