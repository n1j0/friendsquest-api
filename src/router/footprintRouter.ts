import { Request, Response, Router } from 'express'
import { body } from 'express-validator'
import FootprintController from '../controller/footprintController.js'
import { FootprintPostgresRepository } from '../repositories/footprint/footprintPostgresRepository.js'
import { FootprintService } from '../services/footprintService.js'
import { AUTH_HEADER_UID } from '../constants/index.js'
import { MulterFiles } from '../types/multer.js'
import { FootprintRepositoryInterface } from '../repositories/footprint/footprintRepositoryInterface.js'
import { ORM } from '../orm.js'
import { RouterInterface } from './routerInterface.js'
import { UserPostgresRepository } from '../repositories/user/userPostgresRepository.js'
import { UserService } from '../services/userService.js'
import { UserRepositoryInterface } from '../repositories/user/userRepositoryInterface.js'
import { FriendshipRepositoryInterface } from '../repositories/friendship/friendshipRepositoryInterface.js'
import { FriendshipPostgresRepository } from '../repositories/friendship/friendshipPostgresRepository.js'
import { errorHandler } from '../middlewares/errorHandler.js'
import { AttributeInvalidError } from '../errors/AttributeInvalidError.js'
import { AttributeIsMissingError } from '../errors/AttributeIsMissingError.js'
import { DeletionService } from '../services/deletionService.js'

export class FootprintRouter implements RouterInterface {
    readonly router: Router

    private readonly footprintService: FootprintService

    private readonly footprintController: FootprintController

    constructor(
        router: Router,
        orm: ORM,
        footprintService: FootprintService = new FootprintService(),
        userService: UserService = new UserService(),
        deletionService: DeletionService = new DeletionService(),
        userRepository: UserRepositoryInterface = new UserPostgresRepository(userService, deletionService, orm),
        friendshipRepository: FriendshipRepositoryInterface = new FriendshipPostgresRepository(userRepository, orm),
        footprintRepository: FootprintRepositoryInterface = new FootprintPostgresRepository(
            footprintService,
            userRepository,
            friendshipRepository,
            orm,
        ),
        footprintController: FootprintController = new FootprintController(footprintRepository),
    ) {
        this.router = router
        this.footprintService = footprintService
        this.footprintController = footprintController
    }

    getAllFootprintsHandler = (
        _request: Request,
        response: Response,
    ) => this.footprintController.getAllFootprints(response)

    generateGetAllFootprintsRoute = () => {
        /**
         * @openapi
         * /footprints/all:
         *   get:
         *     summary: Returns all footprints
         *     tags:
         *       - Footprint
         *     responses:
         *       200:
         *         description: Returns footprints
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   type: array
         *                   items:
         *                     $ref: '#/components/schemas/Footprint'
         *                 points:
         *                   type: object
         *                   default: {}
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         *       500:
         *         $ref: '#/components/responses/InternalServerError'
         */
        this.router.get('/all', this.getAllFootprintsHandler)
    }

    createFootprintReactionHandler = (
        request: Request,
        response: Response,
    ) => this.footprintController.createFootprintReaction(
        {
            id: request.params.id,
            message: request.body.message,
            uid: request.headers[AUTH_HEADER_UID] as string,
        },
        response,
    )

    generateCreateFootprintReactionRoute = () => {
        /**
         * @openapi
         * /footprints/{id}/reactions:
         *   post:
         *     summary: Create a new reaction
         *     tags:
         *       - Footprint
         *     parameters:
         *       - in: path
         *         name: id
         *         schema:
         *           type: integer
         *         required: true
         *         description: Numeric ID of the footprint the reaction is for
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/NewFootprintReaction'
         *     responses:
         *       201:
         *         description: Returns the created reaction
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   $ref: '#/components/schemas/FootprintReaction'
         *                 points:
         *                   $ref: '#/components/schemas/Points'
         *       400:
         *         $ref: '#/components/responses/BadRequest'
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         *       500:
         *         $ref: '#/components/responses/InternalServerError'
         */
        this.router.post(
            '/:id/reactions',
            [
                body('message')
                    .notEmpty()
                    .withMessage(
                        {
                            message: 'Message is required',
                            type: AttributeIsMissingError,
                        },
                    )
                    .isString()
                    .withMessage(
                        {
                            message: 'Message must be a string',
                            type: AttributeInvalidError,
                        },
                    )
                    .trim(),
            ],
            errorHandler,
            this.createFootprintReactionHandler,
        )
    }

    deleteFootprintReactionHandler = (
        request: Request,
        response: Response,
    ) => this.footprintController.deleteFootprintReaction(
        {
            id: request.params.id,
            uid: request.headers[AUTH_HEADER_UID] as string,
        },
        response,
    )

    generateDeleteFootprintReactionRoute = () => {
        /**
         * @openapi
         * /footprints/reactions/{id}:
         *   delete:
         *     summary: Delete a reaction
         *     tags:
         *       - Footprint
         *     parameters:
         *       - in: path
         *         name: id
         *         schema:
         *           type: integer
         *         required: true
         *         description: Numeric ID of the reaction to delete
         *     responses:
         *       204:
         *         description: Ok
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         *       404:
         *         $ref: '#/components/responses/NotFound'
         */
        this.router.delete(
            '/reactions/:id',
            this.deleteFootprintReactionHandler,
        )
    }

    getFootprintByIdHandler = (request: Request, response: Response) => this.footprintController.getFootprintById(
        {
            id: request.params.id,
            uid: request.headers[AUTH_HEADER_UID] as string,
        },
        response,
    )

    generateGetFootprintByIdRoute = () => {
        /**
         * @openapi
         * /footprints/{id}:
         *   get:
         *     summary: Get a footprint by id
         *     tags:
         *       - Footprint
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
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   $ref: '#/components/schemas/Footprint'
         *                 points:
         *                   $ref: '#/components/schemas/Points'
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         */
        this.router.get(
            '/:id',
            errorHandler,
            this.getFootprintByIdHandler,
        )
    }

    getFootprintReactionsHandler = (
        request: Request,
        response: Response,
    ) => this.footprintController.getFootprintReactions(
        { id: request.params.id },
        response,
    )

    generateGetFootprintReactionsRoute = () => {
        /**
         * @openapi
         * /footprints/{id}/reactions:
         *   get:
         *     summary: Returns all reactions to the specified footprint
         *     tags:
         *       - Footprint
         *     parameters:
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
         *               type: object
         *               properties:
         *                 data:
         *                   type: array
         *                   items:
         *                     $ref: '#/components/schemas/FootprintReaction'
         *                 points:
         *                   type: object
         *                   default: {}
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         *       500:
         *         $ref: '#/components/responses/InternalServerError'
         */
        this.router.get(
            '/:id/reactions',
            errorHandler,
            this.getFootprintReactionsHandler,
        )
    }

    createFootprintHandler = (request: Request, response: Response) => this.footprintController.createFootprint(
        {
            title: request.body.title,
            description: request.body.description,
            latitude: request.body.latitude,
            longitude: request.body.longitude,
            files: request.files as MulterFiles['files'],
            uid: request.headers[AUTH_HEADER_UID] as string,
        },
        response,
    )

    generateCreateFootprintRoute = () => {
        /**
         * @openapi
         * /footprints:
         *   post:
         *     summary: Create a footprint
         *     tags:
         *       - Footprint
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
         *               audio:
         *                 type: string
         *                 format: binary
         *                 description: The audio of the footprint
         *             required:
         *               - image
         *               - audio
         *         multipart/json:
         *           schema:
         *             $ref: '#/components/schemas/NewFootprint'
         *     responses:
         *       201:
         *         description: Returns the created footprint
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   $ref: '#/components/schemas/Footprint'
         *                 points:
         *                   $ref: '#/components/schemas/Points'
         *       400:
         *         $ref: '#/components/responses/BadRequest'
         *       403:
         *         $ref: '#/components/responses/Forbidden'
         *       500:
         *         $ref: '#/components/responses/InternalServerError'
         */
        this.router.post(
            '/',
            this.footprintService.uploadMiddleware.fields(
                [
                    { name: 'image', maxCount: 1 },
                    { name: 'audio', maxCount: 1 },
                ],
            ),
            [
                body('title')
                    .notEmpty()
                    .withMessage(
                        {
                            message: 'Title is required',
                            type: AttributeIsMissingError,
                        },
                    )
                    .isString()
                    .withMessage(
                        {
                            message: 'Title must be a string',
                            type: AttributeInvalidError,
                        },
                    )
                    .trim(),
                body('description')
                    .isString()
                    .withMessage(
                        {
                            message: 'Description must be a string',
                            type: AttributeInvalidError,
                        },
                    )
                    .trim(),
                body('latitude')
                    .notEmpty()
                    .withMessage(
                        {
                            message: 'Latitude is required',
                            type: AttributeIsMissingError,
                        },
                    ),
                body('longitude')
                    .notEmpty()
                    .withMessage(
                        {
                            message: 'Longitude is required',
                            type: AttributeIsMissingError,
                        },
                    ),
            ],
            errorHandler,
            this.createFootprintHandler,
        )
    }

    getFootprintsOfFriendsAndUserHandler = (
        request: Request,
        response: Response,
    ) => this.footprintController.getFootprintsOfFriendsAndUser(
        { uid: request.headers[AUTH_HEADER_UID] as string },
        response,
    )

    generateGetFootprintsOfFriendsAndUserRoute = () => {
        /**
         * @openapi
         * /footprints:
         *   get:
         *     summary: Returns footprints from friends and the user itself
         *     tags:
         *       - Footprint
         *     responses:
         *       200:
         *         description: Returns footprints
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   type: array
         *                   items:
         *                     $ref: '#/components/schemas/FootprintWithFlag'
         *                 points:
         *                   type: object
         *                   default: {}
         *       403:
         *         description: Forbidden access or invalid token
         *       500:
         *         description: Error
         */
        this.router.get('/', this.getFootprintsOfFriendsAndUserHandler)
    }

    createAndReturnRoutes = () => {
        this.generateGetAllFootprintsRoute()
        this.generateGetFootprintsOfFriendsAndUserRoute()
        this.generateCreateFootprintReactionRoute()
        this.generateDeleteFootprintReactionRoute()
        this.generateGetFootprintByIdRoute()
        this.generateGetFootprintReactionsRoute()
        this.generateCreateFootprintRoute()

        return this.router
    }
}
