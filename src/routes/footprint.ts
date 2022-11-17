import { Request, Response, Router } from 'express'
import FootprintController from '../controller/footprintController.js'
import { FootprintPostgresRepository } from '../repositories/footprint/footprintPostgresRepository.js'
import { FootprintService } from '../services/footprintService.js'
import { AUTH_HEADER_UID } from '../constants/index.js'
import { MulterFiles } from '../types/multer.js'
import { FootprintRepositoryInterface } from '../repositories/footprint/footprintRepositoryInterface.js'
import { ORM } from '../orm.js'

export class FootprintRouter {
    private readonly router: Router

    private readonly footprintService: FootprintService

    private readonly footprintRepository: FootprintRepositoryInterface

    private readonly footprintController: FootprintController

    constructor(router: Router, orm: ORM) {
        this.router = router
        this.footprintService = new FootprintService()
        this.footprintRepository = new FootprintPostgresRepository(this.footprintService, orm)
        this.footprintController = new FootprintController(this.footprintRepository)
    }

    createAndReturnRoutes = () => {
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
        this.router.get(
            '/',
            (_request: Request, response: Response) => this.footprintController.getAllFootprints(response),
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
        this.router.post(
            '/:id/reactions',
            (request: Request, response: Response) => this.footprintController.createFootprintReaction(
                {
                    id: request.params.id,
                    message: request.body.message,
                    uid: request.headers[AUTH_HEADER_UID] as string,
                },
                response,
            ),
        )

        /**
         * @openapi
         * /footprints/{id}:
         *   get:
         *     summary: Get a footprint by id
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
        this.router.get(
            '/:id',
            (request: Request, response: Response) => this.footprintController.getFootprintById(
                { id: request.params.id },
                response,
            ),
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
        this.router.get(
            '/:id/reactions',
            (request: Request, response: Response) => this.footprintController.getFootprintReactions(
                { id: request.params.id },
                response,
            ),
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
         *       201:
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
        this.router.post(
            '/',
            this.footprintService.uploadMiddleware.fields(
                [{ name: 'image', maxCount: 1 },
                    { name: 'audio', maxCount: 1 }],
            ),
            (request: Request, response: Response) => this.footprintController.createFootprint(
                {
                    title: request.body.title,
                    latitude: request.body.latitude,
                    longitude: request.body.longitude,
                    files: request.body.files as MulterFiles['files'],
                    uid: request.headers[AUTH_HEADER_UID] as string,
                },
                response,
            ),
        )

        return this.router
    }
}
