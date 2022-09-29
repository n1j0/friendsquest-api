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

/**
 * @openapi
 * /footprints/{id}:
 *   get:
 *     description: Get a footprint by uid
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the footprint to get
 *     responses:
 *       200:
 *         description: Returns a footprint by ID
 */
router.get('/:id', async (request: Request, response: Response) => {
    try {
        const footprint = await $app.footprintRepository.findOne({ id: request.params.id } as any)
        if (footprint) {
            return response.status(200).json(footprint)
        }
        return response.status(404).json({ message: 'Footprint not found' })
    } catch (error: any) {
        return response.status(500).json({ message: error.message })
    }
})

/**
 * @openapi
 * /footprints/{id}/reactions:
 *   get:
 *     description: Returns all reactions to the specified footprint
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the footprint reactions to get
 *     responses:
 *       200:
 *         description: Returns reactions
 *       500:
 *         description: Error
 */
router.get('/:id/reactions', async (request: Request, response: Response) => {
    const footprintId = request.params.id
    if (!footprintId) {
        return response.status(500).json({ message: 'ID is missing' })
    }
    try {
        const footprints = await $app.footprintReactionRepository.findOneOrFail({ footprint: footprintId } as any)
        return response.status(200).json(footprints)
    } catch (error: any) {
        return response.status(500).json({ message: error.message })
    }
})

export const footprintRoutes = router
