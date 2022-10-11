import express, { Request, Response } from 'express'
import UserController from '../controller/userController.js'
import { userPermissionMiddleware } from '../middlewares/userPermission.js'

const router = express.Router()
const userController = new UserController()

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
 */
router.get(
    '/:id',
    (request: Request, response: Response) => userController.getUserById(request, response),
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
 *               firstName:
 *                 type: string
 *                 description: The first name of the user
 *                 required: false
 *               lastName:
 *                 type: string
 *                 description: The first name of the user
 *                 required: false
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 required: true
 *               username:
 *                 type: string
 *                 description: The username of the user
 *                 required: false
 *               birthday:
 *                 type: date
 *                 description: The birthday of the user
 *                 required: false
 *               homeland:
 *                 type: string
 *                 description: The homeland of the user
 *                 required: false
 *           examples:
 *             minimum:
 *               summary: Minimum example for valid creation of user
 *               value:
 *                 firstName: Jon
 *                 email: Jon@Doe.abc
 *             normal:
 *               summary: Example for valid creation of user
 *               value:
 *                 firstName: Jon
 *                 lastName: Doe
 *                 email: Jon@Doe.abc
 *                 username: JonDoe
 *                 birthday: 1990-01-01
 *                 homeland: England
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
 *               firstName:
 *                 type: string
 *                 description: The first name of the user
 *                 required: false
 *               lastName:
 *                 type: string
 *                 description: The first name of the user
 *                 required: false
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 required: true
 *               username:
 *                 type: string
 *                 description: The username of the user
 *                 required: false
 *               birthday:
 *                 type: date
 *                 description: The birthday of the user
 *                 required: false
 *               homeland:
 *                 type: string
 *                 description: The homeland of the user
 *                 required: false
 *           examples:
 *             normal:
 *               summary: Example for valid change of one user
 *               value:
 *                 firstName: Jon
 *                 lastName: Doe
 *                 email: Jon@Doe.abc
 *                 username: JonDoe
 *                 birthday: 1990-01-01
 *                 homeland: England
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
 *               ref: '#/components/schemas/User'
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

export const usersRoutes = router
