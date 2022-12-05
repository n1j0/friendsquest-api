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
        const connection = em.getConnection()
        // TODO: security issue!! userId is from query. So it could be eval input :(
        // TODO: try to simplify this statement as well!
        // eslint-disable-next-line max-len
        return connection.execute(`SELECT f1.id as fs_id, f1.created_at as fs_created_at, f1.updated_at as fs_updated_at, f1.invitor_id as fs_invitor_id, f1.invitee_id as fs_invitee_id, f1.status as fs_status, f2.*  FROM (select "f0".* from "friendship" as "f0" where ("f0"."invitee_id" = ${userId} or "f0"."invitor_id" = ${userId})) f1 LEFT JOIN (SELECT *  FROM public.user WHERE id IN ( SELECT (CASE WHEN f.invitor_id != ${userId} THEN f.invitor_id ELSE f.invitee_id END) AS friend FROM (SELECT t.* FROM public.friendship t WHERE (t.invitor_id = ${userId} OR t.invitee_id = ${userId})) AS f)) as f2 ON (f1.invitee_id = f2.id OR f1.invitor_id = f2.id)`)
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
        const [ _, invitor, invitee ] = await Promise.all([
            em.persistAndFlush(friendship),
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
