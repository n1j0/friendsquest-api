import express, { Request, Response } from 'express'
import { $app } from '../application.js'

const router = express.Router()

/**
 * @openapi
 * /users:
 *   get:
 *     description: Returns all users
 *     responses:
 *       200:
 *         description: Returns books
 */
router.get(
    '/',
    async (_request: Request, response: Response) => response.status(200).json(await $app.userRepository.findAll()),
)

export const usersRoutes = router
