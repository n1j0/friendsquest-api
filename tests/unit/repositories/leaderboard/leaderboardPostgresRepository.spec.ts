import { mock } from 'jest-mock-extended'
import { ORM } from '../../../../src/orm'
import { LeaderboardRepositoryInterface } from '../../../../src/repositories/leaderboard/leaderboardRepositoryInterface'
import { LeaderboardPostgresRepository } from '../../../../src/repositories/leaderboard/leaderboardPostgresRepository'

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
            const top100Users = ['user1']
            const find = jest.fn().mockReturnValue(top100Users)

            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                find,
            }))

            const result = await leaderboardPostgresRepository.getTop100()

            expect(orm.forkEm).toHaveBeenCalled()
            expect(find).toHaveBeenCalledWith('User', {}, { limit: 100, orderBy: [{ points: 'desc' }] })
            expect(result).toBe(top100Users)
        })
    },
)
