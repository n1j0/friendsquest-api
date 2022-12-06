import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { FriendshipRepositoryInterface } from '../../../src/repositories/friendship/friendshipRepositoryInterface'
import { FriendshipPostgresRepository } from '../../../src/repositories/friendship/friendshipPostgresRepository'
import { User } from '../../../src/entities/user'
import { FriendshipAlreadyExistsError } from '../../../src/errors/FriendshipAlreadyExistsError'
import { Friendship } from '../../../src/entities/friendship'
import { UserRepositoryInterface } from '../../../src/repositories/user/userRepositoryInterface'

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
        const find = jest.fn().mockResolvedValueOnce([])

        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            find,
            findOneOrFail: jest.fn(),
        }))

        const friendships = await friendshipPostgresRepository.getFriendships(1)

        expect(orm.forkEm).toHaveBeenCalled()
        // eslint-disable-next-line max-len
        expect(friendships).toBe('friendships')
    })

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

    describe('checkForExistingFriendship', () => {
        it.each([
            [ 1, 0 ],
            [ 0, 1 ],
        ])('throws an error if friendship already exists', async (count1: number, count2: number) => {
            const count = jest.fn().mockReturnValueOnce(count1).mockReturnValue(count2)
            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                count,
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
            expect(count).toHaveBeenNthCalledWith(1, 'Friendship', { invitor: user1, invitee: user2 })
            expect(count).toHaveBeenNthCalledWith(2, 'Friendship', { invitor: user2, invitee: user1 })
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

    it.skip('accepts a friendship', async () => {
        const persistAndFlush = jest.fn().mockResolvedValue(true)
        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            persistAndFlush,
        }))

        const friendship = {
            id: 1,
            foo: 'bar',
            status: 'invited',
        } as unknown as Friendship
        const acceptedFriendship = {
            ...friendship,
            status: 'accepted',
        }

        await friendshipPostgresRepository.acceptFriendship(friendship)

        expect(orm.forkEm).toHaveBeenCalled()
        expect(persistAndFlush).toHaveBeenCalledWith(acceptedFriendship)

        // TODO: mock wrap().assign() and check if it was called with the correct arguments
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
