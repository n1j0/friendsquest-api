import { Request, Response, Router } from 'express'
import { RouterInterface } from './routerInterface.js'
import { LeaderboardController } from '../controller/leaderboardController.js'
import { ORM } from '../orm.js'
import { LeaderboardRepositoryInterface } from '../repositories/leaderboard/leaderboardRepositoryInterface.js'
import { LeaderboardPostgresRepository } from '../repositories/leaderboard/leaderboardPostgresRepository.js'

export class LeaderboardRouter implements RouterInterface {
    readonly router: Router

    private readonly leaderboardController: LeaderboardController

    constructor(
        router: Router,
        orm: ORM,
        leaderboardRepository: LeaderboardRepositoryInterface = new LeaderboardPostgresRepository(orm),
        leaderboardController: LeaderboardController = new LeaderboardController(leaderboardRepository),
    ) {
        this.router = router
        this.leaderboardController = leaderboardController
    }

    getTop100Handler = (_request: Request, response: Response) => this.leaderboardController.getTop100(
        response,
    )

    generateGetLeaderboardRoute = () => {
        /**
         * @openapi
         * /leaderboard:
         *  get:
         *    summary: Get the leaderboard
         *    tags:
         *      - Leaderboard
         *    responses:
         *      200:
         *        description: Returns the leaderboard (top 100 users)
         *        content:
         *          application/json:
         *            schema:
         *              type: object
         *              properties:
         *                data:
         *                  type: array
         *                  items:
         *                    $ref: '#/components/schemas/User'
         *                points:
         *                  type: object
         *                  default: {}
         */
        this.router.get('/', this.getTop100Handler)
    }

    createAndReturnRoutes = () => {
        this.generateGetLeaderboardRoute()
        return this.router
    }
}
