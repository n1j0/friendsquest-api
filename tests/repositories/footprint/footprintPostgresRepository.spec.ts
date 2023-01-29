import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { FootprintService } from '../../../src/services/footprintService'
import { FootprintRepositoryInterface } from '../../../src/repositories/footprint/footprintRepositoryInterface'
import { FootprintPostgresRepository } from '../../../src/repositories/footprint/footprintPostgresRepository'
import { UserRepositoryInterface } from '../../../src/repositories/user/userRepositoryInterface'
import { FriendshipRepositoryInterface } from '../../../src/repositories/friendship/friendshipRepositoryInterface'
import { DeletionService } from '../../../src/services/deletionService'
import { NotFoundError } from '../../../src/errors/NotFoundError'
import { Footprint } from '../../../src/entities/footprint'
import { ForbiddenError } from '../../../src/errors/ForbiddenError'
import { FootprintReaction } from '../../../src/entities/footprintReaction'

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
        deletionService = mock<DeletionService>()
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

    describe('findFootprintById', () => {
        it('returns one footprint by id', async () => {
            const findOneOrFail = jest.fn().mockReturnValue('footprint')
            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                findOneOrFail,
            }))
            const id = 1
            const footprint = await footprintPostgresRepository.findFootprintById(id)

            expect(orm.forkEm).toHaveBeenCalled()
            expect(findOneOrFail).toHaveBeenCalledWith(
                'Footprint',
                { id },
                {
                    failHandler: expect.any(Function),
                    populate: ['createdBy'],
                },
            )
            expect(footprint).toBe('footprint')
        })

        it('throws an error if footprint is not found', async () => {
            const findOneOrFail = jest.fn().mockRejectedValue(new NotFoundError())
            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                findOneOrFail,
            }))
            const id = 1

            await expect(footprintPostgresRepository.findFootprintById(id)).rejects.toThrow(NotFoundError)
        })
    })

    describe('getFootprintById', () => {
        it('return one footprint by id (myFootprint - no points)', async () => {
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

    describe('deleteFootprint', () => {
        it('deletes a footprint with its reactions', async () => {
            const uid = 'abc'
            const id = 1
            const footprint = {
                id,
                createdBy: {
                    id: 19,
                    uid: 'abc',
                },
                audioURL: 'audioURL',
                imageURL: 'imageURL',
            } as unknown as Footprint

            const findFootprintByIdMock = jest.fn().mockResolvedValue(footprint)
            footprintPostgresRepository.findFootprintById = findFootprintByIdMock

            const deleteFilesOfOneFootprintMock = jest.fn().mockResolvedValue([])
            deletionService.deleteFilesOfOneFootprint = deleteFilesOfOneFootprintMock

            const find = jest.fn().mockReturnValue('reactions')
            const remove = jest.fn()
            const removeAndFlush = jest.fn()

            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                find,
                remove,
                removeAndFlush,
            }))

            await footprintPostgresRepository.deleteFootprint({ id, uid })

            expect(orm.forkEm).toHaveBeenCalled()
            expect(findFootprintByIdMock).toHaveBeenCalledWith(id)
            expect(find).toHaveBeenCalledWith('FootprintReaction', { footprint })
            expect(remove).toHaveBeenCalledWith('reactions')
            expect(deleteFilesOfOneFootprintMock).toHaveBeenCalledWith(footprint.audioURL, footprint.imageURL)
            expect(removeAndFlush).toHaveBeenCalledWith(footprint)
        })

        it('throws an error if user is not the owner of the footprint', async () => {
            const uid = 'user-not-owner'
            const id = 1
            const footprint = {
                id,
                createdBy: {
                    id: 19,
                    uid: 'abc',
                },
                audioURL: 'audioURL',
                imageURL: 'imageURL',
            } as unknown as Footprint

            footprintPostgresRepository.findFootprintById = jest.fn().mockResolvedValue(footprint)

            await expect(footprintPostgresRepository.deleteFootprint({ id, uid })).rejects.toThrow(ForbiddenError)
        })

        describe('deleteFootprintReaction', () => {
            it('deletes a footprint reaction', async () => {
                const uid = 'abc'
                const id = 1
                const footprintReaction = {
                    id,
                    createdBy: {
                        id: 19,
                        uid: 'abc',
                    },
                } as unknown as FootprintReaction

                const findOneOrFail = jest.fn().mockResolvedValue(footprintReaction)
                const removeAndFlush = jest.fn()

                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    findOneOrFail,
                    removeAndFlush,
                }))

                await footprintPostgresRepository.deleteFootprintReaction({ id, uid })

                expect(orm.forkEm).toHaveBeenCalled()
                expect(findOneOrFail).toHaveBeenCalledWith(
                    'FootprintReaction',
                    { id },
                    {
                        populate: ['createdBy'],
                        failHandler: expect.any(Function),
                    },
                )
                expect(removeAndFlush).toHaveBeenCalledWith(footprintReaction)
            })

            it('throws an error if user is not the owner of the footprint reaction', async () => {
                const uid = 'user-not-owner'
                const id = 1
                const footprintReaction = {
                    id,
                    createdBy: {
                        id: 19,
                    },
                } as unknown as FootprintReaction

                const findOneOrFail = jest.fn().mockResolvedValue(footprintReaction)
                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    findOneOrFail,
                }))

                await expect(footprintPostgresRepository.deleteFootprintReaction({ id, uid }))
                    .rejects.toThrow(ForbiddenError)
            })
        })
    })

    it('returns all reactions of a footprint', async () => {
        const find = jest.fn().mockReturnValue([])
        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            find,
        }))

        const id = 1
        const reactions = await footprintPostgresRepository.getFootprintReactions(id)

        expect(orm.forkEm).toHaveBeenCalled()
        expect(find).toHaveBeenCalledWith('FootprintReaction', { footprint: { id } }, { populate: ['createdBy'] })
        expect(reactions).toStrictEqual([])
    })
})
