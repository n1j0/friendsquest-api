import express, { Request, Response } from 'express'
import Multer from 'multer'
import FootprintController from '../controller/footprintController.js'

const upload = Multer()
const router = express.Router()
const footprintController = new FootprintController()

// TODO better openapi documentation

/**
 * @openapi
 * /footprints:
 *   get:
 *     description: Returns all footprints
 *     parameters:
 *       - in: header
 *         name: X-Auth
 *         schema:
 *           type: string
 *         required: true
 *         description: Authorization header
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

/**
 * @openapi
 * /footprints/{id}/reactions:
 *   post:
 *     description: Create a new reaction
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
    '/:id/reactions',
    (request: Request, response: Response) => footprintController.createFootprintReaction(request, response),
)

/**
 * @openapi
 * /footprints/{id}:
 *   get:
 *     description: Get a footprint by uid
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

// TODO documentation for post
// TODO picture compression
// TODO audio compression

/**
 * @openapi
 * /footprints:
 *   post:
 *     description: Create a footprint
 *     parameters:
 *       - in: header
 *         name: X-Auth
 *         schema:
 *           type: string
 *         required: true
 *         description: Authorization header
 *     requestBody:
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 file:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Returns reactions
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Error
 */
router.post(
    '/',
    upload.single('file'),
    (request: Request, response: Response) => footprintController.createFootprint(request, response),
)

export const footprintRoutes = router
