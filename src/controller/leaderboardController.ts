import { Response } from 'express'
import { LeaderboardRepositoryInterface } from '../repositories/leaderboard/leaderboardRepositoryInterface.js'
import ResponseController from './responseController.js'

export class LeaderboardController {
    private readonly leaderboardRepository: LeaderboardRepositoryInterface

    constructor(leaderboardRepository: LeaderboardRepositoryInterface) {
        this.leaderboardRepository = leaderboardRepository
    }

    getTop100 = async (response: Response) => ResponseController.sendResponse(
        response,
        200,
        await this.leaderboardRepository.getTop100(),
    )
}
