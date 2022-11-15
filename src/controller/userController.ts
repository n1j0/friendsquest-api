import { Request, Response } from 'express'
import { User } from '../entities/user.js'
import { AUTH_HEADER_UID } from '../constants/index.js'
import ErrorController from './errorController.js'
import { UserService } from '../services/userService.js'
import { UserNotFoundError } from '../errors/UserNotFoundError.js'

export default class UserController {
    private userService: UserService

    constructor(userService: UserService) {
        this.userService = userService
    }

    private userNotFoundError = (response: Response) => ErrorController.sendError(response, 404, 'User not found')

    public isAllowedToEditUser = async (uid: string, request: Request) => {
        try {
            const user = await this.userService.getUserById(request.params.id)
            return user.uid === uid
        } catch {
            return false
        }
    }

    public getAllUsers = async (response: Response) => response.status(200).json(await this.userService.getAllUsers())

    public getUserById = async (request: Request, response: Response) => {
        const { id } = request.params
        if (!id) {
            return response.status(500).json({ message: 'Missing id' })
        }
        try {
            const user = await this.userService.getUserById(id)
            return response.status(200).json(user)
        } catch {
            return this.userNotFoundError(response)
        }
    }

    public getUserByUid = async (request: Request, response: Response) => {
        const { uid } = request.params
        if (!uid) {
            return response.status(500).json({ message: 'Missing uid' })
        }
        try {
            const user = await this.userService.getUserByUid(uid)
            return response.status(200).json(user)
        } catch {
            return this.userNotFoundError(response)
        }
    }

    public createUser = async (request: Request, response: Response) => {
        if (!request.body.email) {
            return ErrorController.sendError(response, 403, 'Email is missing')
        }

        try {
            const user = new User(request.body.email, request.headers[AUTH_HEADER_UID] as string, request.body.username)
            const [ username, email ] = await this
                .userService
                .checkUsernameAndMail(request.body.username, request.body.email)
            if (email !== 0 || username !== 0) {
                return ErrorController.sendError(response, 400, 'Email or Username already taken')
            }
            return response.status(201).json(await this.userService.createUser(user))
        } catch (error: any) {
            return ErrorController.sendError(response, 403, error)
        }
    }

    public updateUser = async (request: Request, response: Response) => {
        // TODO: what if just one attribute has changed?
        // right now this would probably throw an error "Email or Username already taken"
        try {
            const [ username, email ] = await this
                .userService
                .checkUsernameAndMail(request.body.username, request.body.email)
            if (email !== 0 || username !== 0) {
                return ErrorController.sendError(response, 400, 'Email or Username already taken')
            }

            return response.status(200).json(await this.userService.updateUser(request.params.id, request.body))
        } catch (error: any) {
            return error instanceof UserNotFoundError
                ? this.userNotFoundError(response)
                : ErrorController.sendError(response, 500, error)
        }
    }

    public deleteUser = async (request: Request, response: Response) => {
        const { id } = request.params
        if (!id) {
            return ErrorController.sendError(response, 500, 'ID is missing')
        }
        try {
            await this.userService.deleteUser(id)
            return response.status(204).json()
        } catch (error: any) {
            return error instanceof UserNotFoundError
                ? this.userNotFoundError(response)
                : ErrorController.sendError(response, 500, error)
        }
    }
}
