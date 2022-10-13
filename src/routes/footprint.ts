import express, { Request, Response } from 'express'
import Multer from 'multer'
import FootprintController from '../controller/footprintController.js'

// eslint-disable-next-line no-undef
const upload = Multer({ fileFilter(request: Request, file: Express.Multer.File, callback: Multer.FileFilterCallback) {
    if (file.mimetype === 'image/jpeg'
            || file.mimetype === 'image/png'
            || file.mimetype === 'image/jpg'
            || file.mimetype === 'audio/mpeg'
            || file.mimetype === 'audio/mp3'
            || file.mimetype === 'video/mp4') {
        // eslint-disable-next-line unicorn/no-null
        callback(null, true)
    } else {
        callback(new Error('Type of file is not supported'))
    }
} })
const router = express.Router()
const footprintController = new FootprintController()

/**
 * @openapi
 * /footprints:
 *   get:
 *     summary: Returns all footprints
 *     tags:
 *       - Footprint
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Footprint'
 *       403:
 *         description: Forbidden access or invalid token
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
 *     summary: Create a new reaction
 *     tags:
 *       - Footprint
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
 *             $ref: '#/components/schemas/NewFootprintReaction'
 *     responses:
 *       204:
 *         description: Returns the created reaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FootprintReaction'
 *       403:
 *         description: Forbidden access or invalid token
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
 *     summary: Get a footprint by uid
 *     tags:
 *       - Footprint
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Footprint'
 *       403:
 *         description: Forbidden access or invalid token
 */
router.get(
    '/:id',
    (request: Request, response: Response) => footprintController.getFootprintById(request, response),
)

/**
 * @openapi
 * /footprints/{id}/reactions:
 *   get:
 *     summary: Returns all reactions to the specified footprint
 *     tags:
 *       - Footprint
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
 *         description: Returns all reactions to the specified footprint
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FootprintReaction'
 *       403:
 *         description: Forbidden access or invalid token
 *       500:
 *         description: Error
 */
router.get(
    '/:id/reactions',
    (request: Request, response: Response) => footprintController.getFootprintReactions(request, response),
)

/**
 * @openapi
 * /footprints:
 *   post:
 *     summary: Create a footprint
 *     tags:
 *       - Footprint
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The photo of the footprint
 *                 required: false
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: The audio of the footprint
 *                 required: false
 *         multipart/json:
 *           schema:
 *             $ref: '#/components/schemas/NewFootprint'
 *     responses:
 *       200:
 *         description: Returns the created footprint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Footprint'
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Forbidden access or invalid token
 *       500:
 *         description: Error
 */
router.post(
    '/',
    upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]),
    (request: Request, response: Response) => footprintController.createFootprint(request, response),
)

export const footprintRoutes = router
