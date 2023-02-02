import { Request, Response, Router } from 'express'
import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { UserService } from '../../../src/services/userService'
import { DeletionService } from '../../../src/services/deletionService'
import { UserRepositoryInterface } from '../../../src/repositories/user/userRepositoryInterface'
import { FriendshipRepositoryInterface } from '../../../src/repositories/friendship/friendshipRepositoryInterface'
import { FriendshipController } from '../../../src/controller/friendshipController'
import responseMock from '../../test-helper/responseMock'
import { FriendshipRouter } from '../../../src/router/friendshipRouter'

jest.mock('../../../src/services/userService.js', () => ({
    UserService: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('../../../src/services/deletionService.js', () => ({
    DeletionService: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('../../../src/repositories/user/userPostgresRepository.js', () => ({
    UserPostgresRepository: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('../../../src/repositories/friendship/friendshipPostgresRepository.js', () => ({
    FriendshipPostgresRepository: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('../../../src/controller/friendshipController.js', () => ({
    FriendshipController: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('../../../src/constants/index.js', () => ({
    AUTH_HEADER_UID: 'uidHeader',
}))

jest.mock('../../../src/middlewares/errorHandler.js', () => ({
    errorHandler: 'errorHandler',
}))

describe('FriendshipRouter', () => {
    let router: Router
    let orm: ORM
    let userService: UserService
    let deletionService: DeletionService
    let userRepository: UserRepositoryInterface
    let friendshipRepository: FriendshipRepositoryInterface
    let friendshipController: FriendshipController
    let response: Response
    let friendshipRouter: FriendshipRouter

    beforeEach(() => {
        router = mock<Router>()
        orm = mock<ORM>()
        userService = mock<UserService>()
        deletionService = mock<DeletionService>()
        userRepository = mock<UserRepositoryInterface>()
        friendshipRepository = mock<FriendshipRepositoryInterface>()
        friendshipController = mock<FriendshipController>()
        friendshipRouter = new FriendshipRouter(
            router,
            orm,
            userService,
            deletionService,
            userRepository,
            friendshipRepository,
            friendshipController,
        )
        response = responseMock
    })

    it('initializes the constructor with all default values', () => {
        const friendshipRouterWithDefaultValues = new FriendshipRouter(router, orm)
        expect(friendshipRouterWithDefaultValues).toBeDefined()
        expect(friendshipRouterWithDefaultValues.router).toBeDefined()
    })

    it('creates all routes and returns router', () => {
        const generateGetAllFriendshipsRouteSpy = jest.spyOn(friendshipRouter, 'generateGetAllFriendshipsRoute')
        const generateCreateFriendshipRouteSpy = jest.spyOn(friendshipRouter, 'generateCreateFriendshipRoute')
        const generateAcceptFriendshipRouteSpy = jest.spyOn(friendshipRouter, 'generateAcceptFriendshipRoute')
        const generateDeclineOrDeleteFriendshipRouteSpy = jest.spyOn(
            friendshipRouter,
            'generateDeclineOrDeleteFriendshipRoute',
        )

        const routes = friendshipRouter.createAndReturnRoutes()
        expect(routes).toBe(friendshipRouter.router)

        expect(generateGetAllFriendshipsRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateCreateFriendshipRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateAcceptFriendshipRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateDeclineOrDeleteFriendshipRouteSpy).toHaveBeenCalledTimes(1)
    })

    describe('handler functions', () => {
        it('handles getFriendships', () => {
            const userId = 1
            const request = {
                query: {
                    userId,
                },
            } as unknown as Request
            friendshipRouter.getFriendshipsHandler(request, response)
            expect(friendshipController.getFriendshipsByUid).toHaveBeenCalledWith(
                { userId: userId.toString() },
                response,
            )
        })
        it('handles createFriendship', () => {
            const uid = 1
            const friendsCode = 'friendsCode'
            const request = {
                headers: {
                    uidHeader: uid,
                },
                body: {
                    friendsCode,
                },
            } as unknown as Request
            friendshipRouter.createFriendshipHandler(request, response)
            expect(friendshipController.createFriendship).toHaveBeenCalledWith(
                { friendsCode, uid },
                response,
            )
        })
        it('handles acceptFriendship', () => {
            const uid = 1
            const id = 123
            const request = {
                headers: {
                    uidHeader: uid,
                },
                params: {
                    id,
                },
            } as unknown as Request
            friendshipRouter.acceptFriendshipHandler(request, response)
            expect(friendshipController.acceptFriendship).toHaveBeenCalledWith(
                { id, uid },
                response,
            )
        })
        it('handles declineOrDeleteFriendship', () => {
            const uid = 1
            const id = 123
            const request = {
                headers: {
                    uidHeader: uid,
                },
                params: {
                    id,
                },
            } as unknown as Request
            friendshipRouter.declineOrDeleteFriendshipHandler(request, response)
            expect(friendshipController.declineOrDeleteFriendship).toHaveBeenCalledWith(
                { id, uid },
                response,
            )
        })
    })

    describe('routes', () => {
        it('generates getFriendships route', () => {
            friendshipRouter.generateGetAllFriendshipsRoute()
            expect(router.get).toHaveBeenCalledWith('/', friendshipRouter.getFriendshipsHandler)
        })
        it('generates createFriendship route', () => {
            friendshipRouter.generateCreateFriendshipRoute()
            expect(router.post).toHaveBeenCalledWith(
                '/',
                expect.any(Array),
                'errorHandler',
                friendshipRouter.createFriendshipHandler,
            )
        })
        it('generates acceptFriendship route', () => {
            friendshipRouter.generateAcceptFriendshipRoute()
            expect(router.patch).toHaveBeenCalledWith('/:id', friendshipRouter.acceptFriendshipHandler)
        })
        it('generates declineOrDeleteFriendship route', () => {
            friendshipRouter.generateDeclineOrDeleteFriendshipRoute()
            expect(router.delete).toHaveBeenCalledWith(
                '/:id',
                friendshipRouter.declineOrDeleteFriendshipHandler,
            )
        })
    })
})
