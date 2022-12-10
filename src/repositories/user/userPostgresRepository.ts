import { wrap } from '@mikro-orm/core'
import { ORM } from '../../orm.js'
import { User } from '../../entities/user.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { UserRepositoryInterface } from './userRepositoryInterface.js'
import { UserService } from '../../services/userService.js'
import Points from '../../constants/points.js'
import { ValueAlreadyExistsError } from '../../errors/ValueAlreadyExistsError.js'

export class UserPostgresRepository implements UserRepositoryInterface {
    private readonly userService: UserService

    private readonly orm: ORM

    constructor(userService: UserService, orm: ORM) {
        this.userService = userService
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

    getUserById = async (id: number | string) => {
        const em = this.orm.forkEm()
        return em.findOneOrFail(
            'User',
            { id } as any,
            { failHandler: () => { throw new NotFoundError() } },
        )
    }

    getUserByUid = async (uid: number | string) => {
        const em = this.orm.forkEm()
        return em.findOneOrFail(
            'User',
            { uid } as any,
            { failHandler: () => { throw new NotFoundError() } },
        )
    }

    getUserByFriendsCode = async (friendsCode: number | string) => {
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
        return em.removeAndFlush(user)
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
