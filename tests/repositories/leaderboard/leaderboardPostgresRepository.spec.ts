import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { LeaderboardRepositoryInterface } from '../../../src/repositories/leaderboard/leaderboardRepositoryInterface.js'
import { LeaderboardPostgresRepository } from '../../../src/repositories/leaderboard/leaderboardPostgresRepository.js'

describe(
    'LeaderboardPostgresRepository',
    () => {
        let orm: ORM
        let leaderboardPostgresRepository: LeaderboardRepositoryInterface

        beforeEach(() => {
            orm = mock<ORM>()
            leaderboardPostgresRepository = new LeaderboardPostgresRepository(orm)
        })

        it('return top 100 users', async () => {
            const find = jest.fn().mockReturnValue([])

            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                find,
            }))

            await leaderboardPostgresRepository.getTop100()

            expect(orm.forkEm).toHaveBeenCalled()
            expect(find).toHaveBeenCalledWith('User', {}, { limit: 100, orderBy: [{ points: 'desc' }] })
        })
    },
)
