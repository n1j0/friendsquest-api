import { wrap } from '@mikro-orm/core'
import { ORM } from '../../orm.js'
import { FriendshipAlreadyExistsError } from '../../errors/FriendshipAlreadyExistsError.js'
import { Friendship } from '../../entities/friendship.js'
import { User } from '../../entities/user.js'
import { FriendshipStatus } from '../../constants/index.js'
import { FriendshipRepositoryInterface } from './friendshipRepositoryInterface.js'
import { NotFoundError } from '../../errors/NotFoundError'
import { UserRepositoryInterface } from '../user/userRepositoryInterface'
import Points from '../../constants/points'

export class FriendshipPostgresRepository implements FriendshipRepositoryInterface {
    private readonly orm: ORM

    private readonly userRepository: UserRepositoryInterface

    constructor(userRepository: UserRepositoryInterface, orm: ORM) {
        this.userRepository = userRepository
        this.orm = orm
    }

    getFriendships = async (userId: number | string) => {
        const em = this.orm.forkEm()
        const user = await this.userRepository.getUserById(userId)
        const friendships = await em.find(
            'Friendship',
            { $or: [{ invitor: user }, { invitee: user }] } as any,
        )
        return Promise.all(friendships.map(
            async (friendship) => {
                const friend = await this.userRepository.getUserById(
                    friendship.invitor.id === user.id
                        ? friendship.invitee.id : friendship.invitor.id,
                )
                return {
                    ...friendship,
                    invitor: friendship.invitor.id,
                    invitee: friendship.invitee.id,
                    friend,
                }
            },
        ))
    }

    getFriendshipById = async (id: number | string) => {
        const em = this.orm.forkEm()
        return em.findOneOrFail(
            'Friendship',
            { id } as any,
            {
                populate: [ 'invitor', 'invitee' ],
                failHandler: () => { throw new NotFoundError('The friendship') },
            },
        )
    }

    checkForExistingFriendship = async (invitor: User, invitee: User) => {
        const em = this.orm.forkEm()
        const [ invitorFriendship, inviteeFriendship ] = await Promise.all([
            em.count('Friendship', { invitor, invitee } as any),
            em.count('Friendship', { invitee: invitor, invitor: invitee } as any),
        ])
        if (invitorFriendship > 0 || inviteeFriendship > 0) {
            throw new FriendshipAlreadyExistsError()
        }
    }

    createFriendship = async (invitor: User, invitee: User) => {
        const em = this.orm.forkEm()
        const friendship = new Friendship(invitor, invitee)
        await em.persistAndFlush(friendship)
        return friendship
    }

    acceptFriendship = async (friendship: Friendship) => {
        const em = this.orm.forkEm()
        wrap(friendship).assign({
            status: FriendshipStatus.ACCEPTED,
        })
        /* eslint-disable-next-line no-unused-vars */
        await em.persistAndFlush(friendship)
        const [ invitor, invitee ] = await Promise.all([
            this.userRepository.addPoints(friendship.invitor.uid, Points.NEW_FRIENDSHIP),
            this.userRepository.addPoints(friendship.invitee.uid, Points.NEW_FRIENDSHIP),
        ])
        return { invitor, invitee }
    }

    declineOrDeleteExistingFriendship = async (friendship: Friendship) => {
        const em = this.orm.forkEm()
        return em.removeAndFlush(friendship)
    }
}
