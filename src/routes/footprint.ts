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
 *       500:
 *         description: Error
 */
router.get('/', async (_request: Request, response: Response) => {
    try {
        const footprints = await $app.footprintRepository.findAll()
        return response.status(200).json(footprints)
    } catch (error: any) {
        return response.status(500).json({ message: error.message })
    }
})

export const footprintRoutes = router
