import { Request, Response } from 'express'
import { wrap } from '@mikro-orm/core'
import { $app } from '../$app.js'
import { User } from '../entities/user.js'
import { AUTH_HEADER_UID } from '../constants/index.js'
import ErrorController from './errorController'

export default class UserController {
    private userNotFoundError = (response: Response) => ErrorController.sendError(response, 404, 'User not found')

    private checkUsernameAndMail = async (request: Request) => {
        const [ username, email ] = await Promise.all([
            $app.userRepository.count({ username: request.body.username }),
            $app.userRepository.count({ email: request.body.email }),
        ])
        return {
            username,
            email,
        }
    }

    public isAllowedToEditUser = async (uid: string, request: Request) => {
        try {
            const user = await $app.userRepository.findOneOrFail(request.params.id as any)
            return user.uid === uid
        } catch {
            return false
        }
    }

    public getAllUsers = async (response: Response) => response.status(200).json(await $app.userRepository.findAll())

    public getUserById = async (request: Request, response: Response) => {
        const { id } = request.params
        if (!id) {
            return response.status(500).json({ message: 'Missing id' })
        }
        const user = await $app.userRepository.findOne({ id } as any)
        if (user) {
            return response.status(200).json(user)
        }
        return this.userNotFoundError(response)
    }

    public getUserByUid = async (request: Request, response: Response) => {
        const { uid } = request.params
        if (!uid) {
            return response.status(500).json({ message: 'Missing uid' })
        }
        console.log(uid)
        const user = await $app.userRepository.findOne({ uid } as any)
        if (user) {
            return response.status(200).json(user)
        }
        return this.userNotFoundError(response)
    }

    public createUser = async (request: Request, response: Response) => {
        if (!request.body.email) {
            return ErrorController.sendError(response, 403, 'Email is missing')
        }

        try {
            // eslint-disable-next-line security/detect-object-injection
            const user = new User(request.body.email, request.headers[AUTH_HEADER_UID] as string)
            const { username, email } = await this.checkUsernameAndMail(request)
            if (email !== 0 || username !== 0) {
                return response.status(400).json({ message: 'Email or Username already taken' })
            }

            $app.userRepository.persist(user)
            await $app.userRepository.flush()
            return response.status(201).json(user)
        } catch (error: any) {
            return ErrorController.sendError(response, 403, error)
        }
    }

    public updateUser = async (request: Request, response: Response) => {
        try {
            const user = await $app.userRepository.findOneOrFail(request.params.id as any)
            wrap(user).assign(request.body)
            const { username, email } = await this.checkUsernameAndMail(request)
            if (email !== 0 || username !== 0) {
                return ErrorController.sendError(response, 400, 'Email or Username already taken')
            }
            $app.userRepository.persist(user)
            await $app.userRepository.flush()
            return response.status(200).json(user)
        } catch {
            return this.userNotFoundError(response)
        }
    }

    public deleteUser = async (request: Request, response: Response) => {
        const { id } = request.params
        if (!id) {
            return ErrorController.sendError(response, 500, 'ID is missing')
        }
        const user = await $app.userRepository.findOne({ id } as any)
        if (user) {
            try {
                await $app.userRepository.removeAndFlush(user)
                return response.status(204).json()
            } catch (error: any) {
                return ErrorController.sendError(response, 500, error)
            }
        }
        return this.userNotFoundError(response)
    }
}
