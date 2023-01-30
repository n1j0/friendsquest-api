import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { FriendshipRepositoryInterface } from '../../../src/repositories/friendship/friendshipRepositoryInterface'
import { FriendshipPostgresRepository } from '../../../src/repositories/friendship/friendshipPostgresRepository'
import { User } from '../../../src/entities/user'
import { FriendshipAlreadyExistsError } from '../../../src/errors/FriendshipAlreadyExistsError'
import { Friendship } from '../../../src/entities/friendship'
import { UserRepositoryInterface } from '../../../src/repositories/user/userRepositoryInterface'
import { NotFoundError } from '../../../src/errors/NotFoundError'

jest.mock('@mikro-orm/core', () => ({
    PrimaryKey: jest.fn(),
    Property: jest.fn(),
    Entity: jest.fn(),
    ManyToOne: jest.fn(),
    ManyToMany: jest.fn(),
    Enum: jest.fn(),
    types: {
        datetime: jest.fn(),
    },
}))

jest.mock('../../../src/entities/friendship.js')

describe('FriendshipPostgresRepository', () => {
    let orm: ORM
    let userRepository: UserRepositoryInterface
    let friendshipPostgresRepository: FriendshipRepositoryInterface

    beforeEach(() => {
        orm = mock<ORM>()
        userRepository = mock<UserRepositoryInterface>()
        friendshipPostgresRepository = new FriendshipPostgresRepository(userRepository, orm)
    })

    it('returns all friendships of given user id', async () => {
        const id = 1
        const user = {
            id,
        } as unknown as User

        const friendship = {
            invitor: { id: 4 },
            invitee: { id },
        } as unknown as Friendship

        const friendship2 = {
            invitor: { id },
            invitee: { id: 2 },
        } as unknown as Friendship

        const getUserByIdMock = jest.fn().mockResolvedValue(user)
        userRepository.getUserById = getUserByIdMock

        const getFriendshipsWithSpecifiedOptionsMock = jest.fn().mockResolvedValue([ friendship, friendship2 ])
        friendshipPostgresRepository.getFriendshipsWithSpecifiedOptions = getFriendshipsWithSpecifiedOptionsMock

        const friendships = await friendshipPostgresRepository.getFriendshipsByUid(id)

        expect(getUserByIdMock).toHaveBeenCalledWith(id)
        expect(getFriendshipsWithSpecifiedOptionsMock).toHaveBeenCalledWith(
            user,
            {},
            {
                populate: [ 'invitor', 'invitee' ],
            },
        )
        expect(friendships).toStrictEqual([
            {
                ...friendship,
                invitor: friendship.invitor.id,
                invitee: friendship.invitee.id,
                friend: { id: friendship.invitor.id },
            },
            {
                ...friendship2,
                invitor: friendship2.invitor.id,
                invitee: friendship2.invitee.id,
                friend: { id: friendship2.invitee.id },
            }])
    })

    it('returns a friendship with specified options', async () => {
        const find = jest.fn().mockReturnValue(['friendship'])

        const user = {
            id: 1,
        } as unknown as User

        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            find,
        }))

        const result = await friendshipPostgresRepository.getFriendshipsWithSpecifiedOptions(user)

        expect(orm.forkEm).toHaveBeenCalled()
        expect(find).toHaveBeenCalledWith(
            'Friendship',
            {
                $or: [
                    { invitor: user },
                    { invitee: user },
                ],
            },
            {},
        )
        expect(result).toStrictEqual(['friendship'])
    })

    describe('getFriendshipsById', () => {
        it('returns one friendship by id', async () => {
            const findOneOrFail = jest.fn().mockReturnValue('friendship')
            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                findOneOrFail,
            }))

            const id = 1
            const friendship = await friendshipPostgresRepository.getFriendshipById(id)

            expect(orm.forkEm).toHaveBeenCalled()
            expect(findOneOrFail).toHaveBeenCalledWith(
                'Friendship',
                { id },
                {
                    populate: [ 'invitor', 'invitee' ],
                    failHandler: expect.any(Function),
                },
            )
            expect(friendship).toBe('friendship')
        })

        it('throws an error if friendship does not exist', async () => {
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

            await expect(friendshipPostgresRepository.getFriendshipById(id))
                .rejects
                .toThrow(NotFoundError)
        })
    })

    describe('checkForExistingFriendship', () => {
        it.each([
            [ [''], [] ],
            [ [], [''] ],
            // @ts-ignore
        ])('throws an error if friendship already exists', async (invitors: [], invitees: []) => {
            const find = jest.fn().mockReturnValueOnce(invitors).mockReturnValue(invitees)
            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                find,
            }))
            const promiseSpy = jest.spyOn(Promise, 'all')

            const user1 = {
                id: 1,
            } as unknown as User
            const user2 = {
                id: 2,
            } as unknown as User

            await expect(friendshipPostgresRepository.checkForExistingFriendship(user1, user2))
                .rejects
                .toThrow(FriendshipAlreadyExistsError)
            expect(orm.forkEm).toHaveBeenCalled()
            expect(promiseSpy).toHaveBeenCalled()
            expect(find).toHaveBeenNthCalledWith(1, 'Friendship', { invitor: user1, invitee: user2 })
            expect(find).toHaveBeenNthCalledWith(2, 'Friendship', { invitor: user2, invitee: user1 })
        })
    })

    it('creates and returns a new friendship', async () => {
        const persistAndFlush = jest.fn().mockResolvedValue(true)
        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            persistAndFlush,
        }))

        const user1 = {
            id: 1,
        } as unknown as User
        const user2 = {
            id: 2,
        } as unknown as User

        const friendship = await friendshipPostgresRepository.createFriendship(user1, user2)

        expect(orm.forkEm).toHaveBeenCalled()
        expect(Friendship).toHaveBeenCalledWith(user1, user2)
        expect(persistAndFlush).toHaveBeenCalledWith(friendship)
        expect(friendship).toBeInstanceOf(Friendship)
    })

    it('accepts a friendship', async () => {
        const persistAndFlush = jest.fn().mockResolvedValue(true)
        const promiseSpy = jest.spyOn(Promise, 'all')

        const addPointsMock = jest.fn().mockResolvedValueOnce('user1').mockResolvedValueOnce('user2')
        userRepository.addPoints = addPointsMock

        const friendship = {
            id: 1,
            foo: 'bar',
            status: 'invited',
            invitor: {
                uid: 'abc',
            },
            invitee: {
                uid: 'def',
            },
        } as unknown as Friendship
        const acceptedFriendship = {
            ...friendship,
            status: 'accepted',
        }

        const points = {
            NEW_FRIENDSHIP: 250,
        }

        const assign = jest.fn().mockReturnValue(acceptedFriendship)

        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            persistAndFlush,
            assign,
        }))

        const exampleFriendship = await friendshipPostgresRepository.acceptFriendship(friendship)

        expect(orm.forkEm).toHaveBeenCalled()
        expect(assign).toHaveBeenCalledWith(friendship, { status: 'accepted' })
        expect(persistAndFlush).toHaveBeenCalledWith(acceptedFriendship)
        expect(promiseSpy).toHaveBeenCalled()
        expect(addPointsMock).toHaveBeenNthCalledWith(1, friendship.invitor.uid, points.NEW_FRIENDSHIP)
        expect(addPointsMock).toHaveBeenNthCalledWith(2, friendship.invitee.uid, points.NEW_FRIENDSHIP)
        expect(exampleFriendship).toStrictEqual({ invitor: 'user1', invitee: 'user2', points: points.NEW_FRIENDSHIP })
    })

    it('declines or deletes a friendship', async () => {
        const removeAndFlush = jest.fn().mockResolvedValue(true)
        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            removeAndFlush,
        }))

        const friendship = {
            id: 1,
            foo: 'bar',
        } as unknown as Friendship

        await friendshipPostgresRepository.declineOrDeleteExistingFriendship(friendship)

        expect(orm.forkEm).toHaveBeenCalled()
        expect(removeAndFlush).toHaveBeenCalledWith(friendship)
    })
})
