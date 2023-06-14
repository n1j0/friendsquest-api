import { Request, Response, Router } from 'express'
import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { UserService } from '../../../src/services/userService'
import { DeletionService } from '../../../src/services/deletionService'
import { UserRepositoryInterface } from '../../../src/repositories/user/userRepositoryInterface'
import { UserController } from '../../../src/controller/userController'
import { UserRouter } from '../../../src/router/userRouter'
import responseMock from '../../test-helper/responseMock'

jest.mock('../../../src/services/userService.js', () => ({
    UserService: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('../../../src/services/deletionService.js', () => ({
    DeletionService: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('../../../src/repositories/user/userPostgresRepository.js', () => ({
    UserPostgresRepository: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('../../../src/controller/userController.js', () => ({
    UserController: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('../../../src/constants/index.js', () => ({
    AUTH_HEADER_UID: 'uidHeader',
}))

jest.mock('../../../src/middlewares/errorHandler.js', () => ({
    errorHandler: 'errorHandler',
}))

describe('UserRouter', () => {
    let router: Router
    let orm: ORM
    let userService: UserService
    let deletionService: DeletionService
    let userRepository: UserRepositoryInterface
    let userController: UserController
    let userRouter: UserRouter
    let response: Response

    beforeEach(() => {
        router = mock<Router>()
        orm = mock<ORM>()
        userService = mock<UserService>()
        deletionService = mock<DeletionService>()
        userRepository = mock<UserRepositoryInterface>()
        userController = mock<UserController>()
        userRouter = new UserRouter(
            router,
            orm,
            userService,
            deletionService,
            userRepository,
            userController,
        )
        response = responseMock
    })

    it('initializes the constructor with all default values', () => {
        const userRouterWithDefaultValues = new UserRouter(router, orm)
        expect(userRouterWithDefaultValues).toBeDefined()
        expect(userRouterWithDefaultValues.router).toBeDefined()
    })

    it('creates all routes and returns router', () => {
        const generateAllUsersRouteSpy = jest.spyOn(userRouter, 'generateAllUsersRoute')
        const generateGetUserByIdRouteSpy = jest.spyOn(userRouter, 'generateGetUserByIdRoute')
        const generateGetUserByUidRouteSpy = jest.spyOn(userRouter, 'generateGetUserByUidRoute')
        const generateGetUserByFriendsCodeRouteSpy = jest.spyOn(userRouter, 'generateGetUserByFriendsCodeRoute')
        const generateCreateUserRouteSpy = jest.spyOn(userRouter, 'generateCreateUserRoute')
        const generateUpdateUserRouteSpy = jest.spyOn(userRouter, 'generateUpdateUserRoute')
        const generateDeleteUserRouteSpy = jest.spyOn(userRouter, 'generateDeleteUserRoute')
        const generateUpdateMessageTokenRouteSpy = jest.spyOn(userRouter, 'generateUpdateMessageTokenRoute')

        const routes = userRouter.createAndReturnRoutes()
        expect(routes).toBe(userRouter.router)

        expect(generateAllUsersRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateGetUserByIdRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateGetUserByUidRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateGetUserByFriendsCodeRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateCreateUserRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateUpdateUserRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateDeleteUserRouteSpy).toHaveBeenCalledTimes(1)
        expect(generateUpdateMessageTokenRouteSpy).toHaveBeenCalledTimes(1)
    })

    describe('handler functions', () => {
        it('handles getAllUsers', () => {
            userRouter.getAllUsersHandler({} as unknown as Request, response)
            expect(userController.getAllUsers).toHaveBeenCalledWith(response)
        })
        it('handles getUserById', () => {
            const id = 3
            const request = {
                params: {
                    id,
                },
            } as unknown as Request
            userRouter.getUserByIdHandler(request, response)
            expect(userController.getUserById).toHaveBeenCalledWith({ id }, response)
        })
        it('handles getUserByUid', () => {
            const uid = 3
            const request = {
                params: {
                    uid,
                },
            } as unknown as Request
            userRouter.getUserByUidHandler(request, response)
            expect(userController.getUserByUid).toHaveBeenCalledWith({ uid }, response)
        })
        it('handles getUserByFriendsCode', () => {
            const fc = 3
            const request = {
                params: {
                    fc,
                },
            } as unknown as Request
            userRouter.getUserByFriendsCodeHandler(request, response)
            expect(userController.getUserByFriendsCode).toHaveBeenCalledWith({ fc }, response)
        })
        it('handles createUser', () => {
            const email = 'test@test.at'
            const username = 'username'
            const uid = 'uid'
            const request = {
                body: {
                    email,
                    username,
                },
                headers: {
                    uidHeader: uid,
                },
            } as unknown as Request
            userRouter.createUserHandler(request, response)
            expect(userController.createUser).toHaveBeenCalledWith({ email, username, uid }, response)
        })
        it('handles updateUser', () => {
            const email = 'test@test.at'
            const username = 'username'
            const uid = 'uid'
            const request = {
                body: {
                    email,
                    username,
                },
                headers: {
                    uidHeader: uid,
                },
            } as unknown as Request
            userRouter.updateUserHandler(request, response)
            expect(userController.updateUser).toHaveBeenCalledWith({ email, username, uid }, response)
        })
        it('handles deleteUser', () => {
            const uid = 'uid'
            const request = {
                headers: {
                    uidHeader: uid,
                },
            } as unknown as Request
            userRouter.deleteUserHandler(request, response)
            expect(userController.deleteUser).toHaveBeenCalledWith({ uid }, response)
        })
        it('handles updateMessageToken', () => {
            const uid = 'uid'
            const token = 'asgfkhgirw'
            const request = {
                body: {
                    token,
                },
                headers: {
                    uidHeader: uid,
                },
            } as unknown as Request
            userRouter.updateMessageTokenHandler(request, response)
            expect(userController.updateMessageToken).toHaveBeenCalledWith({ token, uid }, response)
        })
    })

    describe('routes', () => {
        it('generates getAllUsers route', () => {
            userRouter.generateAllUsersRoute()
            expect(router.get).toHaveBeenCalledWith('/', userRouter.getAllUsersHandler)
        })
        it('generates getUserById route', () => {
            userRouter.generateGetUserByIdRoute()
            expect(router.get).toHaveBeenCalledWith('/:id', userRouter.getUserByIdHandler)
        })
        it('generates getUserByUid route', () => {
            userRouter.generateGetUserByUidRoute()
            expect(router.get).toHaveBeenCalledWith('/uid/:uid', userRouter.getUserByUidHandler)
        })
        it('generates getUserByFriendsCode route', () => {
            userRouter.generateGetUserByFriendsCodeRoute()
            expect(router.get).toHaveBeenCalledWith('/fc/:fc', userRouter.getUserByFriendsCodeHandler)
        })
        it('generates createUser route', () => {
            userRouter.generateCreateUserRoute()
            expect(router.post).toHaveBeenCalledWith(
                '/',
                expect.any(Array),
                'errorHandler',
                userRouter.createUserHandler,
            )
        })
        it('generates updateUser route', () => {
            userRouter.generateUpdateUserRoute()
            expect(router.patch).toHaveBeenCalledWith(
                '/',
                expect.any(Array),
                'errorHandler',
                userRouter.updateUserHandler,
            )
        })
        it('generates updateMessageToken route', () => {
            userRouter.generateUpdateMessageTokenRoute()
            expect(router.patch).toHaveBeenCalledWith(
                '/message-token',
                expect.any(Array),
                'errorHandler',
                userRouter.updateMessageTokenHandler,
            )
        })
        it('generates deleteUser route', () => {
            userRouter.generateDeleteUserRoute()
            expect(router.delete).toHaveBeenCalledWith('/', userRouter.deleteUserHandler)
        })
    })
})
