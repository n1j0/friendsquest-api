import { wrap } from '@mikro-orm/core'
import { ORM } from '../../orm.js'
import { FriendshipAlreadyExistsError } from '../../errors/FriendshipAlreadyExistsError.js'
import { Friendship } from '../../entities/friendship.js'
import { User } from '../../entities/user.js'
import { FriendshipStatus } from '../../constants/index.js'
import { FriendshipRepositoryInterface } from './friendshipRepositoryInterface.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { UserRepositoryInterface } from '../user/userRepositoryInterface.js'
import Points from '../../constants/points.js'

export class FriendshipPostgresRepository implements FriendshipRepositoryInterface {
    private readonly orm: ORM

    private readonly userRepository: UserRepositoryInterface

    constructor(userRepository: UserRepositoryInterface, orm: ORM) {
        this.userRepository = userRepository
        this.orm = orm
    }

    getFriendshipsWithSpecifiedOptions = async (user: User, filters: {} = {}, options: {} = {}) => {
        const em = this.orm.forkEm()
        return em.find(
            'Friendship',
            {
                $or: [{ invitor: user }, { invitee: user }],
                ...filters,
            } as any,
            options,
        )
    }

    getFriendshipsByUid = async (userId: number | string) => {
        const user = await this.userRepository.getUserById(userId)
        const friendships = await this.getFriendshipsWithSpecifiedOptions(
            user,
            {},
            { populate: [ 'invitor', 'invitee' ] },
        )
        return friendships.map(
            (friendship: Friendship) => ({
                ...friendship,
                invitor: friendship.invitor.id,
                invitee: friendship.invitee.id,
                friend: friendship.invitor.id === user.id ? friendship.invitee : friendship.invitor,
            }),
        )
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
            em.find('Friendship', { invitor, invitee } as any),
            em.find('Friendship', { invitee: invitor, invitor: invitee } as any),
        ])
        if (invitorFriendship.length > 0 || inviteeFriendship.length > 0) {
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
        return { invitor, invitee, points: Points.NEW_FRIENDSHIP }
    }

    declineOrDeleteExistingFriendship = async (friendship: Friendship) => {
        const em = this.orm.forkEm()
        return em.removeAndFlush(friendship)
    }
}
