import express, { Request, Response } from 'express'
import { $app } from '../application.js'

const router = express.Router()

/**
 * @openapi
 * /books:
 *   get:
 *     description: Returns some books
 *     responses:
 *       200:
 *         description: Returns books
 */
router.get(
    '/',
    async (_request: Request, response: Response) => response.status(200).json(await $app.bookRepository.findAll()),
)

export const booksRoutes = router
