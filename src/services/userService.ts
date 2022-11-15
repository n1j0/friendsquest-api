import { wrap } from '@mikro-orm/core'
import { $app } from '../$app.js'
import { User } from '../entities/user.js'
import { UserNotFoundError } from '../errors/UserNotFoundError.js'

export class UserService {
    checkUsernameAndMail = async (username: string, email: string): Promise<[number, number]> => {
        const em = $app.em.fork()
        return Promise.all([
            em.count('User', { username }),
            em.count('User', { email }),
        ])
    }

    getUserById = async (id: number | string) => {
        const em = $app.em.fork()
        return em.findOneOrFail('User', { id } as any)
    }

    getUserByUid = async (uid: number | string) => {
        const em = $app.em.fork()
        return em.findOneOrFail('User', { uid } as any)
    }

    getUserByFriendsCode = async (friendsCode: number | string) => {
        const em = $app.em.fork()
        return em.findOneOrFail('User', { friendsCode } as any)
    }

    getAllUsers = async () => {
        const em = $app.em.fork()
        return em.getRepository('User').findAll()
    }

    createUser = async (user: User) => {
        const em = $app.em.fork()
        await em.persistAndFlush(user)
        const userInDatabase = await em.findOne('User', { uid: user.uid } as any)
        userInDatabase.friendsCode = (userInDatabase.id - 1).toString(16).padStart(6, '0').toUpperCase()
        wrap(user).assign(userInDatabase)
        await em.persistAndFlush(user)
        return user
    }

    updateUser = async (id: number | string, userData: any) => {
        const em = $app.em.fork()
        const user = await em.findOne('User', { id } as any)
        if (!user) {
            throw new UserNotFoundError()
        }
        wrap(user).assign(userData)
        await em.persistAndFlush(user)
        return user
    }

    deleteUser = async (id: number | string) => {
        const em = $app.em.fork()
        const user = await em.findOne('User', { id } as any)
        if (!user) {
            throw new UserNotFoundError()
        }
        return em.removeAndFlush(user)
    }
}
