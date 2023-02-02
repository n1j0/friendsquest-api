import { Request, Response, Router } from 'express'
import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { LeaderboardRepositoryInterface } from '../../../src/repositories/leaderboard/leaderboardRepositoryInterface'
import { LeaderboardController } from '../../../src/controller/leaderboardController'
import responseMock from '../../test-helper/responseMock'
import { LeaderboardRouter } from '../../../src/router/leaderboardRouter'

jest.mock('../../../src/repositories/leaderboard/leaderboardPostgresRepository.js', () => ({
    LeaderboardPostgresRepository: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('../../../src/controller/leaderboardController.js', () => ({
    LeaderboardController: jest.fn().mockImplementation(() => ({})),
}))

describe('LeaderboardRouter', () => {
    let router: Router
    let orm: ORM
    let leaderboardRepository: LeaderboardRepositoryInterface
    let leaderboardController: LeaderboardController
    let response: Response
    let leaderboardRouter: LeaderboardRouter

    beforeEach(() => {
        router = mock<Router>()
        orm = mock<ORM>()
        leaderboardRepository = mock<LeaderboardRepositoryInterface>()
        leaderboardController = mock<LeaderboardController>()
        leaderboardRouter = new LeaderboardRouter(
            router,
            orm,
            leaderboardRepository,
            leaderboardController,
        )

        response = responseMock
    })

    it('initializes the constructor with all default values', () => {
        const leaderboardRouterWithDefaultValues = new LeaderboardRouter(router, orm)
        expect(leaderboardRouterWithDefaultValues).toBeDefined()
        expect(leaderboardRouterWithDefaultValues.router).toBeDefined()
    })

    it('creates all routes and returns router', () => {
        const generateGetLeaderboardRouteSpy = jest.spyOn(leaderboardRouter, 'generateGetLeaderboardRoute')

        const routes = leaderboardRouter.createAndReturnRoutes()
        expect(routes).toBe(leaderboardRouter.router)

        expect(generateGetLeaderboardRouteSpy).toHaveBeenCalledTimes(1)
    })

    describe('handler functions', () => {
        it('handles getTop100', () => {
            leaderboardRouter.getTop100Handler({} as unknown as Request, response)
            expect(leaderboardController.getTop100).toHaveBeenCalledWith(response)
        })
    })

    describe('routes', () => {
        it('generates getLeaderboard route', () => {
            leaderboardRouter.generateGetLeaderboardRoute()
            expect(router.get).toHaveBeenCalledWith('/', leaderboardRouter.getTop100Handler)
        })
    })
})
