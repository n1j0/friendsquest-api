import { wrap } from '@mikro-orm/core'
import { ORM } from '../../orm.js'
import { User } from '../../entities/user.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { UserRepositoryInterface } from './userRepositoryInterface.js'
import { UserService } from '../../services/userService.js'
import Points from '../../constants/points.js'
import { ValueAlreadyExistsError } from '../../errors/ValueAlreadyExistsError.js'
import { DeletionService } from '../../services/deletionService.js'
import { Footprint } from '../../entities/footprint.js'

export class UserPostgresRepository implements UserRepositoryInterface {
    private readonly userService: UserService

    private readonly deletionService: DeletionService

    private readonly orm: ORM

    constructor(userService: UserService, deletionService: DeletionService, orm: ORM) {
        this.userService = userService
        this.deletionService = deletionService
        this.orm = orm
    }

    checkUsernameAndMail = async (username: string, email: string): Promise<void> => {
        const em = this.orm.forkEm()
        const [ userByUsername, userByMail ] = await Promise.all([
            em.find('User', { username }),
            em.find('User', { email }),
        ])
        if (userByUsername.length > 0 || userByMail.length > 0) {
            throw new ValueAlreadyExistsError('Username or email already exists')
        }
    }

    getUserById = async (id: number | string): Promise<User> => {
        const em = this.orm.forkEm()
        return em.findOneOrFail(
            'User',
            { id } as any,
            { failHandler: () => { throw new NotFoundError() } },
        )
    }

    getUserByUid = async (uid: number | string): Promise<User> => {
        const em = this.orm.forkEm()
        return em.findOneOrFail(
            'User',
            { uid } as any,
            { failHandler: () => { throw new NotFoundError() } },
        )
    }

    getUserByFriendsCode = async (friendsCode: number | string): Promise<User> => {
        const em = this.orm.forkEm()
        return em.findOneOrFail(
            'User',
            { friendsCode } as any,
            { failHandler: () => { throw new NotFoundError() } },
        )
    }

    getAllUsers = async () => {
        const em = this.orm.forkEm()
        return em.getRepository('User').findAll()
    }

    createUser = async (user: User) => {
        const em = this.orm.forkEm()
        await em.persistAndFlush(user)
        const userInDatabase = await this.getUserByUid(user.uid)
        const friendsCode = this.userService.numberToBase36String(userInDatabase.id - 1)
        wrap(user).assign({
            friendsCode,
        })
        await em.persistAndFlush(user)
        return user
    }

    updateUser = async (uid: string, userData: any) => {
        const em = this.orm.forkEm()
        const user = await this.getUserByUid(uid)
        wrap(user).assign({
            ...userData,
            points: user.points + Points.PROFILE_EDITED,
        })
        await em.persistAndFlush(user)
        return { user, points: Points.PROFILE_EDITED }
    }

    deleteUser = async (uid: string) => {
        const em = this.orm.forkEm()
        const user = await this.getUserByUid(uid)
        if (!user.footprints.isInitialized()) {
            await user.footprints.init()
        }
        user.footprints.removeAll()
        // we can't include repos here due to circular dependency injection in the router
        const [ friendships, footprints ] = await Promise.all([
            em.find('Friendship', { $or: [{ invitor: user }, { invitee: user }] }),
            em.find('Footprint', { createdBy: user } as any) as Promise<Footprint[]>,
        ])
        const reactions = await em.find(
            'FootprintReaction',
            { $or: [{ createdBy: user }, { footprint: [...footprints] }] },
        )
        await Promise.all(footprints.map(async (footprint) => {
            if (!footprint.users.isInitialized()) {
                await footprint.users.init()
            }
            footprint.users.removeAll()
            em.persist(footprint)
        }))
        em.persist(user)
        em.remove(friendships)
        em.remove(reactions)
        em.remove(footprints)
        em.remove(user)
        await Promise.all([
            em.flush(),
            this.deletionService.deleteFiles(uid),
        ])
        return this.deletionService.deleteUser(uid)
    }

    addPoints = async (uid: string, points: number) => {
        const em = this.orm.forkEm()
        const user = await this.getUserByUid(uid)
        wrap(user).assign({
            points: user.points + points,
        })
        try {
            await em.persistAndFlush(user)
        } catch { /* empty */ }
        return user
    }
}
