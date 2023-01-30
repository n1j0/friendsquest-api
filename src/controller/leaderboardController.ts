import { Response } from 'express'
import { LeaderboardRepositoryInterface } from '../repositories/leaderboard/leaderboardRepositoryInterface.js'
import ResponseSender from '../helper/responseSender.js'
import { InternalServerError } from '../errors/InternalServerError.js'

export class LeaderboardController {
    private readonly leaderboardRepository: LeaderboardRepositoryInterface

    constructor(leaderboardRepository: LeaderboardRepositoryInterface) {
        this.leaderboardRepository = leaderboardRepository
    }

    getTop100 = async (response: Response) => {
        try {
            const top100 = await this.leaderboardRepository.getTop100()
            return ResponseSender.result(response, 200, top100)
        } catch (error: any) {
            return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }
}
