import { Request, Response, Router } from 'express'
import { mock, mockDeep } from 'jest-mock-extended'
import { ORM } from '../../src/orm'
import { FootprintService } from '../../src/services/footprintService'
import { FootprintRepositoryInterface } from '../../src/repositories/footprint/footprintRepositoryInterface'
import FootprintController from '../../src/controller/footprintController'
import { FootprintPostgresRepository } from '../../src/repositories/footprint/footprintPostgresRepository'
import { FootprintRouter } from '../../src/router/footprintRouter'
import responseMock from '../test-helper/responseMock'
import { MulterFiles } from '../../src/types/multer'
import { UserService } from '../../src/services/userService'
import { UserRepositoryInterface } from '../../src/repositories/user/userRepositoryInterface'
import { FriendshipRepositoryInterface } from '../../src/repositories/friendship/friendshipRepositoryInterface'
import { DeletionService } from '../../src/services/deletionService'

jest.mock('../../src/repositories/footprint/footprintPostgresRepository.js', () => ({
    FootprintPostgresRepository: {},
}))

jest.mock('../../src/constants/index.js', () => ({
    AUTH_HEADER_UID: 'uidHeader',
}))

describe('FootprintRouter', () => {
    let router: Router
    let orm: ORM
    let footprintService: FootprintService
    let footprintRepository: FootprintRepositoryInterface
    let userService: UserService
    let deletionService: DeletionService
    let userRepository: UserRepositoryInterface
    let friendshipRepository: FriendshipRepositoryInterface
    let footprintController: FootprintController
    let footprintRouter: FootprintRouter
    let response: Response

    beforeEach(() => {
        router = mock<Router>()
        orm = mock<ORM>()
        footprintService = mockDeep<FootprintService>()
        footprintRepository = mock<FootprintPostgresRepository>()
        userService = mock<UserService>()
        deletionService = mock<DeletionService>()
        userRepository = mock<UserRepositoryInterface>()
        friendshipRepository = mock<FriendshipRepositoryInterface>()
        footprintController = mock<FootprintController>()
        footprintRouter = new FootprintRouter(
            router,
            orm,
            footprintService,
            userService,
            deletionService,
            userRepository,
            friendshipRepository,
            footprintRepository,
            footprintController,
        )
        response = responseMock
    })

    it('creates all routes and returns router', () => {
        const generateGetAllFootprintsRouteSpy = jest.spyOn(footprintRouter, 'generateGetAllFootprintsRoute')
        const generateCreateFootprintReactionRouteSpy = jest.spyOn(
            footprintRouter,
            'generateCreateFootprintReactionRoute',
        )
        const generateGetFootprintByIdRouteSpy = jest.spyOn(footprintRouter, 'generateGetFootprintByIdRoute')
        const generateGetFootprintReactionsRouteSpy = jest.spyOn(footprintRouter, 'generateGetFootprintReactionsRoute')
        const generateCreateFootprintRouteSpy = jest.spyOn(footprintRouter, 'generateCreateFootprintRoute')

        const result = footprintRouter.createAndReturnRoutes()

        expect(result).toBe(footprintRouter.router)

        expect(generateGetAllFootprintsRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateCreateFootprintReactionRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateGetFootprintByIdRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateGetFootprintReactionsRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateCreateFootprintRouteSpy).toHaveBeenCalledTimes(1)
    })

    describe('handler functions', () => {
        it('handles getAllFootprints', () => {
            footprintRouter.getAllFootprintsHandler({} as unknown as Request, response)
            expect(footprintController.getAllFootprints).toHaveBeenCalledWith(response)
        })

        it('handles createFootprintReaction', () => {
            const id = 1
            const message = 'test'
            const uid = 'uid'
            const request = {
                params: {
                    id,
                },
                body: {
                    message,
                },
                headers: {
                    uidHeader: uid,
                },
            } as unknown as Request
            footprintRouter.createFootprintReactionHandler(request, response)
            expect(footprintController.createFootprintReaction).toHaveBeenCalledWith(
                { id, message, uid },
                response,
            )
        })

        it('handles getFootprintById', () => {
            const id = 1
            const uid = 'uid'
            const request = {
                params: {
                    id,
                },
                headers: {
                    uidHeader: uid,
                },
            } as unknown as Request
            footprintRouter.getFootprintByIdHandler(request, response)
            expect(footprintController.getFootprintById).toHaveBeenCalledWith(
                { uid, id },
                response,
            )
        })

        it('handles getFootprintReactions', () => {
            const id = 1
            const request = {
                params: {
                    id,
                },
            } as unknown as Request
            footprintRouter.getFootprintReactionsHandler(request, response)
            expect(footprintController.getFootprintReactions).toHaveBeenCalledWith(
                { id },
                response,
            )
        })

        it('handles createFootprint', () => {
            const title = 'title'
            const latitude = '12345678'
            const longitude = '98765432'
            const files = {} as unknown as MulterFiles['files']
            const uid = 'uid'
            const request = {
                body: {
                    title,
                    latitude,
                    longitude,
                },
                files,
                headers: {
                    uidHeader: uid,
                },
            } as unknown as Request
            footprintRouter.createFootprintHandler(request, response)
            expect(footprintController.createFootprint).toHaveBeenCalledWith(
                { title, latitude, longitude, files, uid },
                response,
            )
        })
    })

    describe('routes', () => {
        it('generates getAllFootprints route', () => {
            footprintRouter.generateGetAllFootprintsRoute()
            expect(router.get).toHaveBeenCalledWith('/all', footprintRouter.getAllFootprintsHandler)
        })

        it('generates generateCreateFootprintReaction route', () => {
            footprintRouter.generateCreateFootprintReactionRoute()
            expect(router.post).toHaveBeenCalledWith(
                '/:id/reactions',
                expect.any(Array),
                expect.any(Function),
                footprintRouter.createFootprintReactionHandler,
            )
        })

        it('generates generateGetFootprintById route', () => {
            footprintRouter.generateGetFootprintByIdRoute()
            expect(router.get).toHaveBeenCalledWith(
                '/:id',
                expect.any(Function),
                footprintRouter.getFootprintByIdHandler,
            )
        })

        it('generates generateGetFootprintReactions route', () => {
            footprintRouter.generateGetFootprintReactionsRoute()
            expect(router.get).toHaveBeenCalledWith(
                '/:id/reactions',
                expect.any(Function),
                footprintRouter.getFootprintReactionsHandler,
            )
        })

        it('generates generateCreateFootprint route', () => {
            const fields = jest.fn()
            // @ts-ignore
            footprintService.uploadMiddleware.fields.mockImplementation(() => fields)
            footprintRouter.generateCreateFootprintRoute()
            expect(router.post).toHaveBeenCalledWith(
                '/',
                fields,
                expect.any(Array),
                expect.any(Function),
                footprintRouter.createFootprintHandler,
            )
            expect(footprintService.uploadMiddleware.fields).toHaveBeenCalledWith([
                { name: 'image', maxCount: 1 },
                { name: 'audio', maxCount: 1 },
            ])
        })
    })
})
