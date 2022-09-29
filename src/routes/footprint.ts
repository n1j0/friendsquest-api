import express, { Request, Response } from 'express'
import { $app } from '../application.js'

const router = express.Router()

/**
 * @openapi
 * /footprints:
 *   get:
 *     description: Returns all footprints
 *     responses:
 *       200:
 *         description: Returns footprints
 */
router.get(
    '/',
    async (_request: Request, response: Response) => response
        .status(200)
        .json(await $app.footprintRepository.findAll()),
)

export const footprintRoutes = router
