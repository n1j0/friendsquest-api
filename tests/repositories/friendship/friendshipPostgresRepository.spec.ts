import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { FriendshipRepositoryInterface } from '../../../src/repositories/friendship/friendshipRepositoryInterface'
import { FriendshipPostgresRepository } from '../../../src/repositories/friendship/friendshipPostgresRepository'
import { User } from '../../../src/entities/user'
import { FriendshipAlreadyExistsError } from '../../../src/errors/FriendshipAlreadyExistsError'
import { Friendship } from '../../../src/entities/friendship'

jest.mock('@mikro-orm/core', () => ({
    PrimaryKey: jest.fn(),
    Property: jest.fn(),
    Entity: jest.fn(),
    ManyToOne: jest.fn(),
    Enum: jest.fn(),
}))

jest.mock('../../../src/entities/friendship.js')

describe('FriendshipPostgresRepository', () => {
    let orm: ORM
    let friendshipPostgresRepository: FriendshipRepositoryInterface

    beforeEach(() => {
        orm = mock<ORM>()
        friendshipPostgresRepository = new FriendshipPostgresRepository(orm)
    })

    it('returns all friendships for given user id', async () => {
        const execute = jest.fn().mockReturnValue('friendships')
        const getConnection = jest.fn().mockImplementation(() => ({
            execute,
        }))
        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            getConnection,
        }))

        const friendships = await friendshipPostgresRepository.getFriendships(1)

        expect(orm.forkEm).toHaveBeenCalled()
        expect(getConnection).toHaveBeenCalled()
        // eslint-disable-next-line max-len
        expect(execute).toHaveBeenCalledWith('SELECT f1.id as fs_id, f1.created_at as fs_created_at, f1.updated_at as fs_updated_at, f1.invitor_id as fs_invitor_id, f1.invitee_id as fs_invitee_id, f1.status as fs_status, f2.*  FROM (select "f0".* from "friendship" as "f0" where ("f0"."invitee_id" = 1 or "f0"."invitor_id" = 1)) f1 LEFT JOIN (SELECT *  FROM public.user WHERE id IN ( SELECT (CASE WHEN f.invitor_id != 1 THEN f.invitor_id ELSE f.invitee_id END) AS friend FROM (SELECT t.* FROM public.friendship t WHERE (t.invitor_id = 1 OR t.invitee_id = 1)) AS f)) as f2 ON (f1.invitee_id = f2.id OR f1.invitor_id = f2.id)')
        expect(friendships).toBe('friendships')
    })

    it('returns one friendship by id', async () => {
        const findOne = jest.fn().mockReturnValue('friendship')
        // @ts-ignore
        orm.forkEm.mockImplementation(() => ({
            findOne,
        }))

        const id = 1
        const friendship = await friendshipPostgresRepository.getFriendshipById(id)

        expect(orm.forkEm).toHaveBeenCalled()
        expect(findOne).toHaveBeenCalledWith('Friendship', { id }, { populate: [ 'invitor', 'invitee' ] })
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
