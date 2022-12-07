import { Response } from 'express'
import { User } from '../entities/user.js'
import ErrorController from './errorController.js'
import { NotFoundError } from '../errors/NotFoundError.js'
import { AttributeIsMissingError } from '../errors/AttributeIsMissingError.js'
import { UserRepositoryInterface } from '../repositories/user/userRepositoryInterface.js'
import { ForbiddenError } from '../errors/ForbiddenError.js'
import { ValueAlreadyExistsError } from '../errors/ValueAlreadyExistsError.js'
import { InternalServerError } from '../errors/InternalServerError.js'
import { NegativeNumbersNotAllowedError } from '../errors/NegativeNumbersNotAllowedError.js'
import { MaximumFriendsCodeLimitExceededError } from '../errors/MaximumFriendsCodeLimitExceededError.js'

export default class UserController {
    private userRepository: UserRepositoryInterface

    constructor(userRepository: UserRepositoryInterface) {
        this.userRepository = userRepository
    }

    private userNotFoundError = (response: Response) => ErrorController.sendError(
        response,
        NotFoundError.getErrorDocument('The user'),
    )

    getAllUsers = async (response: Response) => response.status(200).json(await this.userRepository.getAllUsers())

    getUserById = async ({ id }: { id: number | string }, response: Response) => {
        if (!id) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('ID'))
        }
        try {
            const user = await this.userRepository.getUserById(id)
            return response.status(200).json(user)
        } catch (error: any) {
            return error instanceof NotFoundError
                ? this.userNotFoundError(response)
                : ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    getUserByUid = async ({ uid }: { uid: number | string }, response: Response) => {
        if (!uid) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('UID'))
        }
        try {
            const user = await this.userRepository.getUserByUid(uid)
            return response.status(200).json(user)
        } catch (error: any) {
            return error instanceof NotFoundError
                ? this.userNotFoundError(response)
                : ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    createUser = async (
        { email, username, uid }: { email: string, username: string, uid: string },
        response: Response,
    ) => {
        if (!email) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('Email'))
        }

        if (!username) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('Username'))
        }

        try {
            const user = new User(email, uid, username)
            await this.userRepository.checkUsernameAndMail(username, email)
            return response.status(201).json(await this.userRepository.createUser(user))
        } catch (error: any) {
            switch (error.constructor) {
            case ValueAlreadyExistsError: {
                return ErrorController.sendError(
                    response,
                    ValueAlreadyExistsError.getErrorDocument(error.message),
                )
            }
            case ForbiddenError: {
                return ErrorController.sendError(response, ForbiddenError.getErrorDocument())
            }
            case NegativeNumbersNotAllowedError: {
                return ErrorController.sendError(response, NegativeNumbersNotAllowedError.getErrorDocument())
            }
            case MaximumFriendsCodeLimitExceededError: {
                return ErrorController.sendError(response, MaximumFriendsCodeLimitExceededError.getErrorDocument())
            }
            default: {
                return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
            }
            }
        }
    }

    updateUser = async (
        { email, username, uid, body }: { email: string, username: string, uid: string, body: any },
        response: Response,
    ) => {
        // TODO: what if just one attribute has changed?
        // right now this would probably throw an error "Email or Username already taken"
        try {
            await this.userRepository.checkUsernameAndMail(username, email)
            return response.status(200).json(await this.userRepository.updateUser(uid, body))
        } catch (error: any) {
            switch (error.constructor) {
            case ValueAlreadyExistsError: {
                return ErrorController.sendError(
                    response,
                    ValueAlreadyExistsError.getErrorDocument(error.message),
                )
            }
            case NotFoundError: {
                return this.userNotFoundError(response)
            }
            default: {
                return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
            }
            }
        }
    }

    deleteUser = async ({ uid }: { uid: string }, response: Response) => {
        if (!uid) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('Uid'))
        }
        try {
            await this.userRepository.deleteUser(uid)
            return response.status(204).json()
        } catch (error: any) {
            return error instanceof NotFoundError
                ? this.userNotFoundError(response)
                : ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }
}
