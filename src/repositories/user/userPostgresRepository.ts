import { wrap } from '@mikro-orm/core'
import { ORM } from '../../orm.js'
import { User } from '../../entities/user.js'
import { NotFoundError } from '../../errors/NotFoundError'
import { UserRepositoryInterface } from './userRepositoryInterface.js'
import { UserService } from '../../services/userService.js'

export class UserPostgresRepository implements UserRepositoryInterface {
    private readonly userService: UserService

    private readonly orm: ORM

    constructor(userService: UserService, orm: ORM) {
        this.userService = userService
        this.orm = orm
    }

    checkUsernameAndMail = async (username: string, email: string): Promise<[number, number]> => {
        const em = this.orm.forkEm()
        return Promise.all([
            em.count('User', { username }),
            em.count('User', { email }),
        ])
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
        // TODO: don't forget to handle the errors "numberToBase36String" can throw
        userInDatabase.friendsCode = this.userService.numberToBase36String(userInDatabase.id - 1)
        wrap(user).assign(userInDatabase)
        await em.persistAndFlush(user)
        return user
    }

    updateUser = async (uid: string, userData: any) => {
        const em = this.orm.forkEm()
        const user = await this.getUserByUid(uid)
        wrap(user).assign(userData)
        await em.persistAndFlush(user)
        return user
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
        await em.persistAndFlush(user)
        return user
    }
}
