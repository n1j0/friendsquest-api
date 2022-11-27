import { Response } from 'express'
import { User } from '../entities/user.js'
import ErrorController from './errorController.js'
import { UserNotFoundError } from '../errors/UserNotFoundError.js'
import { UserRepositoryInterface } from '../repositories/user/userRepositoryInterface.js'

export default class UserController {
    private userRepository: UserRepositoryInterface

    constructor(userRepository: UserRepositoryInterface) {
        this.userRepository = userRepository
    }

    private userNotFoundError = (response: Response) => ErrorController.sendError(response, 404, 'User not found')

    isAllowedToEditUser = async (uid: string, id: string) => {
        try {
            const user = await this.userRepository.getUserById(id)
            return user.uid === uid
        } catch {
            return false
        }
    }

    getAllUsers = async (response: Response) => response.status(200).json(await this.userRepository.getAllUsers())

    getUserById = async ({ id }: { id: number | string }, response: Response) => {
        if (!id) {
            return response.status(500).json({ message: 'Missing id' })
        }
        try {
            const user = await this.userRepository.getUserById(id)
            return response.status(200).json(user)
        } catch {
            return this.userNotFoundError(response)
        }
    }

    getUserByUid = async ({ uid }: { uid: number | string }, response: Response) => {
        if (!uid) {
            return response.status(500).json({ message: 'Missing uid' })
        }
        try {
            const user = await this.userRepository.getUserByUid(uid)
            return response.status(200).json(user)
        } catch {
            return this.userNotFoundError(response)
        }
    }

    createUser = async (
        { email, username, uid }: { email: string, username: string, uid: string },
        response: Response,
    ) => {
        if (!email) {
            return ErrorController.sendError(response, 403, 'Email is missing')
        }

        if (!username) {
            return ErrorController.sendError(response, 403, 'Username is missing')
        }

        try {
            const user = new User(email, uid, username)
            const [ numberOfSameUsername, numberOfSameMail ] = await this
                .userRepository
                .checkUsernameAndMail(username, email)
            if (numberOfSameUsername !== 0 || numberOfSameMail !== 0) {
                return ErrorController.sendError(response, 400, 'Email or Username already taken')
            }
            return response.status(201).json(await this.userRepository.createUser(user))
        } catch (error: any) {
            return ErrorController.sendError(response, 403, error)
        }
    }

    updateUser = async (
        { email, username, id, body }: { email: string, username: string, id: number | string, body: any },
        response: Response,
    ) => {
        // TODO: what if just one attribute has changed?
        // right now this would probably throw an error "Email or Username already taken"
        try {
            const [ numberOfSameUsername, numberOfSameMail ] = await this
                .userRepository
                .checkUsernameAndMail(username, email)
            if (numberOfSameUsername !== 0 || numberOfSameMail !== 0) {
                return ErrorController.sendError(response, 400, 'Email or Username already taken')
            }

            return response.status(200).json(await this.userRepository.updateUser(id, body))
        } catch (error: any) {
            return error instanceof UserNotFoundError
                ? this.userNotFoundError(response)
                : ErrorController.sendError(response, 500, error)
        }
    }

    deleteUser = async ({ id }: { id: number | string }, response: Response) => {
        if (!id) {
            return ErrorController.sendError(response, 500, 'ID is missing')
        }
        try {
            await this.userRepository.deleteUser(id)
            return response.status(204).json()
        } catch (error: any) {
            return error instanceof UserNotFoundError
                ? this.userNotFoundError(response)
                : ErrorController.sendError(response, 500, error)
        }
    }
}
