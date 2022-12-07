import { Response } from 'express'
import { LeaderboardRepositoryInterface } from '../repositories/leaderboard/leaderboardRepositoryInterface.js'

export class LeaderboardController {
    private readonly leaderboardRepository: LeaderboardRepositoryInterface

    constructor(leaderboardRepository: LeaderboardRepositoryInterface) {
        this.leaderboardRepository = leaderboardRepository
    }

    getTop100 = async (response: Response) => response
        .status(200)
        .json(await this.leaderboardRepository.getTop100())
}
