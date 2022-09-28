import express, { Request, Response } from 'express'
import { wrap } from '@mikro-orm/core'
import { $app } from '../application.js'
import { User } from '../entities/user.js'

const router = express.Router()

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
 *     description: Returns all users
 *     responses:
 *       200:
 *         description: Returns persons
 */
router.get(
    '/',
    async (_request: Request, response: Response) => response.status(200).json(await $app.userRepository.findAll()),
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
            const user = new User(request.body.email)
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
