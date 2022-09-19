import express, { Request, Response } from 'express'

const router = express.Router()

/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.get('/', (_request: Request, response: Response) => response.status(200).json('Hello World'))

export default router
