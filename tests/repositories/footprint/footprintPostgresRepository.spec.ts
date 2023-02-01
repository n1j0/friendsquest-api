import { mock } from 'jest-mock-extended'
import { MulterFiles } from '../../../src/types/multer'
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
import { User } from '../../../src/entities/user'
import { Friendship } from '../../../src/entities/friendship'
import { NewFootprint } from '../../../src/types/footprint'

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
            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                findOneOrFail: (
                    entityName: any,
                    where: any,
                    { failHandler }:
                        {
                            failHandler: () => {}
                        },
                ) => failHandler(),
            }))

            const id = 1

            await expect(footprintPostgresRepository.findFootprintById(id)).rejects.toThrow(NotFoundError)
        })
    })

    describe('getFootprintById', () => {
        it('return one footprint by id (myFootprint - no points)', async () => {
            const uid = 'abc'
            const id = '123'

            const isInitialized = jest.fn().mockReturnValue(false)
            const init = jest.fn().mockReturnValue(true)
            const promiseSpy = jest.spyOn(Promise, 'all')

            const footprint = {
                id: '1',
                createdBy: {
                    id,
                },
                users: {
                    isInitialized,
                    init,
                    add: jest.fn(),
                },
            }
            const user = { id, uid, points: 10 }

            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                isInitialized,
            }))

            const findFootprintByIdMock = jest.fn().mockResolvedValue(footprint)
            footprintPostgresRepository.findFootprintById = findFootprintByIdMock

            const getUserByUidMock = jest.fn().mockResolvedValue(user)
            userRepository.getUserByUid = getUserByUidMock

            userRepository.addPoints = jest.fn()

            const result = await footprintPostgresRepository.getFootprintById(uid, footprint.id)

            expect(orm.forkEm).toHaveBeenCalled()
            expect(promiseSpy).toHaveBeenCalled()
            expect(findFootprintByIdMock).toHaveBeenCalledWith(footprint.id)
            expect(getUserByUidMock).toHaveBeenCalledWith(uid)
            expect(footprint.users.isInitialized).toHaveBeenCalled()
            expect(footprint.users.init).toHaveBeenCalled()
            expect(result).toEqual({ footprint })
        })

        it('return one footprint by id (notMyFootprint - points)', async () => {
            const uid = 'abc'
            const id = '123'
            const myFootprint = false

            const promiseSpy = jest.spyOn(Promise, 'all')
            const isInitialized = jest.fn().mockReturnValue(true)
            const init = jest.fn().mockReturnValue(true)
            const persistAndFlush = jest.fn().mockReturnValue(true)

            const points = {
                FOOTPRINT_VIEWED: 500,
            }

            const footprint = {
                id: '1',
                createdBy: {
                    id: '456',
                },
                users: {
                    isInitialized,
                    init,
                    add: jest.fn(),
                },
            }

            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                isInitialized,
                persistAndFlush,
            }))

            const user = { id, uid, points: 10 }
            const userUpdate = { id, uid, points: 510 }

            const findFootprintByIdMock = jest.fn().mockResolvedValue(footprint)
            footprintPostgresRepository.findFootprintById = findFootprintByIdMock

            const getUserByUidMock = jest.fn().mockResolvedValue(user)
            userRepository.getUserByUid = getUserByUidMock

            userRepository.addPoints = jest.fn()

            const addPoints = jest.fn().mockResolvedValue(userUpdate)
            userRepository.addPoints = addPoints

            const result = await footprintPostgresRepository.getFootprintById(uid, footprint.id)

            expect(orm.forkEm).toHaveBeenCalled()
            expect(promiseSpy).toHaveBeenCalled()
            expect(findFootprintByIdMock).toHaveBeenCalledWith(footprint.id)
            expect(getUserByUidMock).toHaveBeenCalledWith(uid)
            expect(result.footprint.users.add).toHaveBeenCalledWith(user)
            expect(myFootprint).toBeFalsy()
            expect(persistAndFlush).toHaveBeenCalledWith(footprint)
            expect(addPoints).toHaveBeenCalledWith(user.uid, points.FOOTPRINT_VIEWED)
            expect(result).toEqual({ footprint, points: points.FOOTPRINT_VIEWED, userPoints: userUpdate.points })
        })

        it('return footprint if error is thrown', async () => {
            const uid = 'abc'
            const id = '123'

            const isInitialized = jest.fn().mockReturnValue(true)
            const init = jest.fn().mockReturnValue(true)
            const persistAndFlush = jest.fn().mockRejectedValue(new Error('error'))

            const footprint = {
                id: '1',
                createdBy: {
                    id: '456',
                },
                users: {
                    isInitialized,
                    init,
                    add: jest.fn(),
                },
            }

            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                isInitialized,
                persistAndFlush,
            }))

            const user = { id, uid, points: 10 }

            footprintPostgresRepository.findFootprintById = jest.fn().mockResolvedValue(footprint)

            userRepository.getUserByUid = jest.fn().mockResolvedValue(user)

            userRepository.addPoints = jest.fn()

            const result = await footprintPostgresRepository.getFootprintById(uid, footprint.id)

            expect(orm.forkEm).toHaveBeenCalled()
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

        it('throws an ForbiddenError if user is not the owner of the footprint reaction', async () => {
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

        it('throws an NotFoundError if footprint reaction does not exist', async () => {
            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                findOneOrFail: (
                    entityName: any,
                    where: any,
                    { failHandler }:
                        {
                            failHandler: () => {}
                        },
                ) => failHandler(),
            }))

            await expect(footprintPostgresRepository.deleteFootprintReaction({ id: 1, uid: 'abc' }))
                .rejects.toThrow(NotFoundError)
        })
    })

    describe('hasUserReactedOrCreatedFootprint', () => {
        // TODO: reactions.filter is not tested
        it('returns true if the footprint was created by the user', async () => {
            const id = '123'
            const reactions = [
                { createdBy: { id } },
                { createdBy: { id: '456' } },
            ] as unknown as FootprintReaction[]
            const footprint = { createdBy: { id } } as unknown as Footprint
            const user = { id } as unknown as User

            const result = await footprintPostgresRepository.hasUserReactedOrCreatedFootprint(
                reactions,
                footprint,
                user.id,
            )
            expect(result).toEqual(true)
        })

        it('returns true if there are reactions by the user', async () => {
            const id = '123'

            const reactions = [
                { createdBy: { id } },
                { createdBy: { id: '456' } },
            ] as unknown as FootprintReaction[]
            const footprint = { createdBy: { id: '323' } } as unknown as Footprint
            const user = { id } as unknown as User
            const result = await footprintPostgresRepository.hasUserReactedOrCreatedFootprint(
                reactions,
                footprint,
                user.id,
            )

            expect(result).toBe(true)
        })

        it('returns false if there are no reactions by the user', async () => {
            const reactions = [
                { createdBy: { id: '444' } },
                { createdBy: { id: '456' } },
            ] as unknown as FootprintReaction[]
            const footprint = { createdBy: { id: '323' } } as unknown as Footprint
            const user = { id: '123' } as unknown as User
            const result = await footprintPostgresRepository.hasUserReactedOrCreatedFootprint(
                reactions,
                footprint,
                user.id,
            )

            expect(result).toBe(false)
        })
    })

    describe('createFootprintReaction', () => {
        it.skip('creates a footprint reaction', async () => {
            const message = 'message'

            const user = {
                id: 19,
                uid: 'abc',
                points: 10,
            } as unknown as User

            const footprint = {
                id: 1,
                createdBy: {
                    ...user,
                },
            } as unknown as Footprint

            const footprintReactionCreated = {
                id: 1,
                createdBy: {
                    ...user,
                },
                footprint,
                message,
                createdAt: '',
                updatedAt: '',
            } as unknown as FootprintReaction

            const points = {
                FOOTPRINT_REACTION: 150,
            }

            const userWithUpdatedPoints = {
                points: 160,
            }

            const footprintReactions = [footprintReactionCreated]

            const findFootprintByIdMock = jest.fn().mockResolvedValue(footprint)
            footprintPostgresRepository.findFootprintById = findFootprintByIdMock

            const getUserByUidMock = jest.fn().mockResolvedValue(user)
            userRepository.getUserByUid = getUserByUidMock

            const find = jest.fn().mockResolvedValue(footprintReactions)
            const persistAndFlush = jest.fn().mockResolvedValue(footprintReactionCreated)

            // @ts-ignore
            FootprintReaction.mockReturnValue(footprintReactionCreated)

            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                find,
                persistAndFlush,
            }))

            const hasUserReactedOrCreatedFootprintMock = jest.fn().mockResolvedValue(false)
            const addPointsMock = jest.fn().mockReturnValue(user)

            const result = await footprintPostgresRepository.createFootprintReaction(
                { id: footprint.id, message, uid: user.uid },
            )

            expect(orm.forkEm).toHaveBeenCalled()
            expect(findFootprintByIdMock).toHaveBeenCalledWith(footprint.id)
            expect(getUserByUidMock).toHaveBeenCalledWith(user.uid)
            expect(find).toHaveBeenCalledWith('FootprintReaction', { footprint: { id: footprint.id } })
            expect(persistAndFlush).toHaveBeenCalledWith(footprintReactionCreated)
            expect(hasUserReactedOrCreatedFootprintMock).toHaveBeenCalledWith(footprintReactions, footprint, user.id)
            expect(addPointsMock).toHaveBeenCalledWith(user, points.FOOTPRINT_REACTION)
            expect(result).toStrictEqual({
                footprintReaction: footprintReactionCreated,
                points: points.FOOTPRINT_REACTION,
                userPoints: userWithUpdatedPoints.points,
            })
        })

        it.skip('throws an NotFoundError if footprint does not exist', async () => {
            // const promiseSpy = jest.fn()
            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                findOneOrFail: (
                    entityName: any,
                    where: any,
                    { failHandler }:
                        {
                            failHandler: () => {}
                        },
                ) => failHandler(),
            }))

            // const result = await footprintPostgresRepository.createFootprintReaction()

            // expect(orm.forkEm).toHaveBeenCalled()
        })
    })

    it('return a new footprint with points and user points', async () => {
        const user = {
            uid: 'abc',
            points: 10,
        } as unknown as User

        const temperature = 20
        const userPointsCreated = 310

        const audioURL = 'audioURL'
        const photoURL = 'photoURL'

        const footprint = {
            title: 'title',
            description: 'description',
            latitude: 1,
            longitude: 1,
            files: {
                audio: audioURL,
                image: photoURL,
            } as unknown as MulterFiles['files'],
            uid: user.uid,
        } as unknown as NewFootprint

        const footprintCreated = {
            title: footprint.title,
            user,
            latitude: footprint.latitude,
            longitude: footprint.longitude,
            photoURL: 'imageURL',
            audioURL,
            temperature,
        } as unknown as Footprint

        const footprintWithDescription = {
            ...footprintCreated,
            description: footprint.description,
        } as unknown as Footprint

        const promiseSpy = jest.spyOn(Promise, 'all')

        const getUserByUidMock = jest.fn().mockResolvedValue(user.uid)
        userRepository.getUserByUid = getUserByUidMock

        const uploadToFileStorageMock = jest.fn().mockResolvedValue([ audioURL, photoURL ])
        footprintService.uploadFilesToFireStorage = uploadToFileStorageMock

        const getTemperatureMock = jest.fn().mockResolvedValue({ main: { temp: temperature } })
        footprintService.getTemperature = getTemperatureMock

        const addPointsMock = jest.fn().mockResolvedValue({ points: userPointsCreated })
        userRepository.addPoints = addPointsMock

        const assign = jest.fn().mockReturnValue(footprintWithDescription)

        const persistAndFlush = jest.fn().mockResolvedValue(true)

        // @ts-ignore
        Footprint.mockReturnValue(footprintCreated)

        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            assign,
            persistAndFlush,
        }))

        const points = {
            FOOTPRINT_CREATED: 300,
        }
        const result = await footprintPostgresRepository.createFootprint(footprint)

        expect(orm.forkEm).toHaveBeenCalled()
        expect(promiseSpy).toHaveBeenCalled()
        expect(getUserByUidMock).toHaveBeenCalledWith(user.uid)
        expect(uploadToFileStorageMock).toHaveBeenCalledWith(footprint.files, user.uid)
        expect(getTemperatureMock).toHaveBeenCalledWith(footprint.latitude, footprint.longitude)
        expect(assign).toHaveBeenCalledWith(footprintCreated, { description: footprint.description })
        expect(persistAndFlush).toHaveBeenCalledWith(footprintWithDescription)
        expect(addPointsMock).toHaveBeenCalledWith(user.uid, points.FOOTPRINT_CREATED)
        expect(result).toStrictEqual({
            footprint: footprintWithDescription,
            points: points.FOOTPRINT_CREATED,
            userPoints: userPointsCreated,
        })
    })

    it('returns all footprints of friends and the user', async () => {
        const includes = jest.fn().mockReturnValueOnce(true)

        const getIdentifiers = jest.fn().mockImplementation(() => ({
            includes,
        }))

        const getIdentifiersNot = jest.fn().mockImplementation(() => ({
            includes: () => false,
        }))

        const friendId1 = 3
        const friendId2 = 5
        const user2Id = 33

        const user = {
            id: 1,
            uid: 'abc',
        } as unknown as User

        const friendship = {
            id: 1,
            invitor: {
                id: 1,
            },
            invitee: {
                id: friendId2,
            },
        } as unknown as Friendship

        const friendship2 = {
            id: 2,
            invitor: {
                id: friendId1,
            },
            invitee: {
                id: 1,
            },
        } as unknown as Friendship

        const friendships: Friendship [] = [ friendship, friendship2 ]

        const footprint = {
            id: 1,
            createdBy: {
                id: user.id,
            },
            users: {
                getIdentifiers,
            },
        } as unknown as Footprint

        const footprint2 = {
            id: 2,
            createdBy: {
                id: user2Id,
            },
            users: {
                getIdentifiers: getIdentifiersNot,
            },
        }
        const friends = [ friendId2, friendId1 ]
        const getUserByUidMock = jest.fn().mockResolvedValue(user)
        userRepository.getUserByUid = getUserByUidMock

        const getFriendshipsWithSpecifiedOptionsMock = jest.fn().mockResolvedValue(friendships)
        friendshipRepository.getFriendshipsWithSpecifiedOptions = getFriendshipsWithSpecifiedOptionsMock

        const find = jest.fn().mockReturnValue([ footprint, footprint2 ])
        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            find,
        }))

        const result = await footprintPostgresRepository.getFootprintsOfFriendsAndUser(user.uid)

        expect(orm.forkEm).toHaveBeenCalled()
        expect(getUserByUidMock).toHaveBeenCalledWith(user.uid)
        expect(getFriendshipsWithSpecifiedOptionsMock).toHaveBeenCalledWith(
            user,
            { status: 'accepted' },
            { fields: [{ invitor: ['id'] }, { invitee: ['id'] }] },
        )
        expect(find).toHaveBeenCalledWith(
            'Footprint',
            {
                createdBy: [ user, ...friends ],
            },
            {
                populate: [ 'createdBy', 'users' ],
            },
        )

        expect(getIdentifiers).toHaveBeenCalledWith('id')
        expect(getIdentifiersNot).toHaveBeenCalledWith('id')
        expect(includes).toHaveBeenCalledWith(user.id)
        expect(result).toStrictEqual([{ ...footprint, hasVisited: true }, { ...footprint2, hasVisited: false }])
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
