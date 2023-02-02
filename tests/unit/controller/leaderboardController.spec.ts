import { Response } from 'express'
import { mock } from 'jest-mock-extended'
import { LeaderboardController } from '../../../src/controller/leaderboardController'
import { LeaderboardRepositoryInterface } from '../../../src/repositories/leaderboard/leaderboardRepositoryInterface'
import responseMock from '../../test-helper/responseMock'
import ResponseSender from '../../../src/helper/responseSender'
import { InternalServerError } from '../../../src/errors/InternalServerError'

describe('LeaderboardController', () => {
    let leaderboardController: LeaderboardController
    let leaderboardRepository: LeaderboardRepositoryInterface
    let errorSpy: jest.SpyInstance
    let resultSpy: jest.SpyInstance
    let response: Response

    beforeEach(() => {
        response = responseMock
        leaderboardRepository = mock<LeaderboardRepositoryInterface>()
        leaderboardController = new LeaderboardController(leaderboardRepository)
        errorSpy = jest.spyOn(ResponseSender, 'error')
        resultSpy = jest.spyOn(ResponseSender, 'result')
    })

    describe('getTop100', () => {
        it('returns top 100 users', async () => {
            const result = 'top100'
            // @ts-ignore
            leaderboardRepository.getTop100.mockReturnValue(result)
            await leaderboardController.getTop100(response)
            expect(leaderboardRepository.getTop100).toHaveBeenCalled()
            expect(resultSpy).toHaveBeenCalledWith(response, 200, result)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            leaderboardRepository.getTop100.mockImplementation(() => {
                throw error
            })
            await leaderboardController.getTop100(response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })
})
