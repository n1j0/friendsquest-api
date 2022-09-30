import express, { Request, Response } from 'express'
import UserController from '../controller/userController.js'
import { userPermissionMiddleware } from '../middlewares/userPermission.js'

const router = express.Router()
const userController = new UserController()

// TODO better openapi documentation
// TODO create tests

/**
 * @openapi
 * /users:
 *   get:
 *     description: Returns all users
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
 */
router.get(
    '/',
    (_request: Request, response: Response) => userController.getAllUsers(response),
)

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     description: Get a user by uid
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
 */
router.get(
    '/:id',
    (request: Request, response: Response) => userController.getUserById(request, response),
)

/**
 * @openapi
 * /users:
 *   post:
 *     description: Create a new user
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
 */
router.post(
    '/',
    (request: Request, response: Response) => userController.createUser(request, response),
)

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     description: Update a user by uid
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
 *       400:
 *         description: Email or Username already taken
 *       404:
 *         description: User not found
 */
router.patch(
    '/:id',
    userPermissionMiddleware((uid, request) => userController.isAllowedToEditUser(uid, request)),
    (request: Request, response: Response) => userController.updateUser(request, response),
)

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     description: Delete a user by uid
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
 *       404:
 *         description: User not found
 */
router.delete(
    '/:id',
    userPermissionMiddleware((uid, request) => userController.isAllowedToEditUser(uid, request)),
    (request: Request, response: Response) => userController.deleteUser(request, response),
)

export const usersRoutes = router
