import express, { Request, Response } from 'express'
import FootprintController from '../controller/footprintController.js'

const router = express.Router()
const footprintController = new FootprintController()

// TODO better openapi documentation

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
router.get(
    '/',
    (_request: Request, response: Response) => footprintController.getAllFootprints(response),
)

// TODO user information needs to be added

/**
 * @openapi
 * /footprints/{id}:
 *   post:
 *     description: Create a new reaction
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Numeric ID of the footprint the reaction is for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message of the reaction
 *                 required: true
 *     responses:
 *       204:
 *         description: OK
 *       500:
 *         description: Error
 */
router.post(
    '/:id',
    (request: Request, response: Response) => footprintController.createFootprintReaction(request, response),
)

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
router.get(
    '/:id',
    (request: Request, response: Response) => footprintController.getFootprintById(request, response),
)

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
router.get(
    '/:id/reactions',
    (request: Request, response: Response) => footprintController.getFootprintReactions(request, response),
)

export const footprintRoutes = router
