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
        // override orm with own custom mock
        // create fake "mockImplementation((entityName, {}, {failHandler: () => {}}) => { failHandler() })
        // expect(() => methode()).toThrowError(NotFoundError)
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
        const userWithFriendsCode = em.assign(user, { friendsCode })
        await em.persistAndFlush(userWithFriendsCode)
        return userWithFriendsCode
    }

    updateUser = async (uid: string, userData: { username: string, email: string }) => {
        const em = this.orm.forkEm()
        const userByUid = await this.getUserByUid(uid)
        const user = em.assign(userByUid, { ...userData, points: userByUid.points + Points.PROFILE_EDITED })
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
            em.find(
                'Footprint',
                { createdBy: user } as any,
                { populate: ['users'] } as any,
            ) as Promise<Footprint[]>,
        ])
        const reactions = await em.find(
            'FootprintReaction',
            { $or: [{ createdBy: user }, { footprint: [...footprints] }] },
        )
        footprints.forEach((footprint) => {
            footprint.users.removeAll()
            em.persist(footprint)
        })
        em.persist(user)
        em.remove(friendships)
        em.remove(reactions)
        em.remove(footprints)
        em.remove(user)
        await Promise.all([
            em.flush(),
            this.deletionService.deleteAllUserFiles(uid),
        ])
        return this.deletionService.deleteUser(uid)
    }

    addPoints = async (uid: string, points: number) => {
        const em = this.orm.forkEm()
        const user = await this.getUserByUid(uid)
        const userWithPoints = em.assign(user, { points: user.points + points })
        try {
            await em.persistAndFlush(userWithPoints)
        } catch { /* empty */ }
        return userWithPoints
    }
}
