import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { FootprintService } from '../../../src/services/footprintService'
import { FootprintRepositoryInterface } from '../../../src/repositories/footprint/footprintRepositoryInterface'
import { FootprintPostgresRepository } from '../../../src/repositories/footprint/footprintPostgresRepository'
import { UserRepositoryInterface } from '../../../src/repositories/user/userRepositoryInterface'
import { FriendshipRepositoryInterface } from '../../../src/repositories/friendship/friendshipRepositoryInterface'
import { DeletionService } from '../../../src/services/deletionService'

jest.mock('node-fetch', () => jest.fn().mockResolvedValue('node-fetch'))

jest.mock('@mikro-orm/core', () => ({
    PrimaryKey: jest.fn(),
    Property: jest.fn(),
    Entity: jest.fn(),
    OneToMany: jest.fn(),
    ManyToOne: jest.fn(),
    ManyToMany: jest.fn(),
    Enum: jest.fn(),
    Formula: jest.fn(),
    types: {
        datetime: jest.fn(),
    },
}))

jest.mock('../../../src/entities/footprint.js')

describe('FootprintPostgresRepository', () => {
    let orm: ORM
    let footprintPostgresRepository: FootprintRepositoryInterface
    let userRepository: UserRepositoryInterface
    let friendshipRepository: FriendshipRepositoryInterface
    let footprintService: FootprintService
    let deletionService: DeletionService

    beforeEach(() => {
        orm = mock<ORM>()
        footprintService = mock<FootprintService>()
        friendshipRepository = mock<FriendshipRepositoryInterface>()
        userRepository = mock<UserRepositoryInterface>()
        footprintPostgresRepository = new FootprintPostgresRepository(
            footprintService,
            deletionService,
            userRepository,
            friendshipRepository,
            orm,
        )
    })

    it('returns all footprints', async () => {
        const findAll = jest.fn().mockReturnValue([])
        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            getRepository: () => ({
                findAll,
            }),
        }))

        const footprints = await footprintPostgresRepository.getAllFootprints()

        expect(orm.forkEm).toHaveBeenCalled()
        expect(findAll).toHaveBeenCalledWith({ populate: ['createdBy'] })
        expect(footprints).toStrictEqual([])
    })

    describe.skip('getFootprintById', () => {
        it('return one footprint by id (myFootprint)', async () => {
            const uid = 'abc'
            const id = '123'

            /* const points = {
                FOOTPRINT_VIEWED: 50,
            } */

            const footprint = {
                id: '1',
                createdBy: {
                    id,
                },
                users: {
                    isInitialized: jest.fn().mockReturnValue(true),
                    add: jest.fn(),
                },
            }
            const user = { id, uid, points: 10 }

            const findFootprintByIdMock = jest.fn().mockResolvedValue(footprint)
            footprintPostgresRepository.findFootprintById = findFootprintByIdMock

            const getUserByUidMock = jest.fn().mockResolvedValue(user)
            userRepository.getUserByUid = getUserByUidMock

            userRepository.addPoints = jest.fn()

            const result = await footprintPostgresRepository.getFootprintById(uid, footprint.id)

            expect(orm.forkEm).toHaveBeenCalled()
            expect(findFootprintByIdMock).toHaveBeenCalledWith(footprint.id)
            expect(getUserByUidMock).toHaveBeenCalledWith(uid)
            // TODO: ask if I should test this
            expect(result.footprint.users.add).not.toHaveBeenCalled()
            expect(result).toEqual({ footprint })
        })
    })
})
