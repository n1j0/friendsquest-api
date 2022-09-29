import { Request, Response } from 'express'
import { wrap } from '@mikro-orm/core'
import { $app } from '../application.js'
import { User } from '../entities/user.js'

export default class UserController {
    private userNotFoundError = (response: Response) => {
        response.status(404).send({
            message: 'User not found',
        })
    }

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

    public createUser = async (request: Request, response: Response) => {
        if (!request.body.email) {
            return response.status(400).json({ message: 'Email is missing' })
        }

        const user = new User(request.body.email)
        const { username, email } = await this.checkUsernameAndMail(request)
        if (email !== 0 || username !== 0) {
            return response.status(400).json({ message: 'Email or Username already taken' })
        }

        await $app.userRepository.persist(user)
        return response.status(201).json(user)
    }

    public updateUser = async (request: Request, response: Response) => {
        try {
            const user = await $app.userRepository.findOneOrFail(request.params.id as any)
            wrap(user).assign(request.body)
            const { username, email } = await this.checkUsernameAndMail(request)
            if (email !== 0 || username !== 0) {
                return response.status(400).json({ message: 'Email or Username already taken' })
            }
            await $app.userRepository.persist(user)

            return response.status(200).json(user)
        } catch {
            return this.userNotFoundError(response)
        }
    }

    public deleteUser = async (request: Request, response: Response) => {
        const { id } = request.params
        if (!id) {
            return response.status(500).json({ message: 'Missing id' })
        }
        const user = await $app.userRepository.findOne({ id } as any)
        if (user) {
            try {
                await $app.userRepository.removeAndFlush(user)
                return response.status(204).json()
            } catch (error: any) {
                return response.status(500).json({ message: error.message })
            }
        }
        return this.userNotFoundError(response)
    }
}
