import { Response } from 'express'
import { NotFoundError } from '../errors/NotFoundError.js'
import { UserRepositoryInterface } from '../repositories/user/userRepositoryInterface.js'
import { ForbiddenError } from '../errors/ForbiddenError.js'
import { ValueAlreadyExistsError } from '../errors/ValueAlreadyExistsError.js'
import { InternalServerError } from '../errors/InternalServerError.js'
import { NegativeNumbersNotAllowedError } from '../errors/NegativeNumbersNotAllowedError.js'
import { MaximumFriendsCodeLimitExceededError } from '../errors/MaximumFriendsCodeLimitExceededError.js'
import ResponseSender from '../helper/responseSender.js'

export class UserController {
    private userRepository: UserRepositoryInterface

    constructor(userRepository: UserRepositoryInterface) {
        this.userRepository = userRepository
    }

    userNotFoundError = (response: Response) => ResponseSender.error(
        response,
        NotFoundError.getErrorDocument('The user'),
    )

    getAllUsers = async (response: Response) => {
        try {
            return ResponseSender.result(
                response,
                200,
                await this.userRepository.getAllUsers(),
            )
        } catch (error: any) {
            return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    getUserById = async ({ id }: { id: number | string }, response: Response) => {
        try {
            return ResponseSender.result(response, 200, await this.userRepository.getUserById(id))
        } catch (error: any) {
            return error instanceof NotFoundError
                ? this.userNotFoundError(response)
                : ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    getUserByUid = async ({ uid }: { uid: number | string }, response: Response) => {
        try {
            return ResponseSender.result(response, 200, await this.userRepository.getUserByUid(uid))
        } catch (error: any) {
            return error instanceof NotFoundError
                ? this.userNotFoundError(response)
                : ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    getUserByFriendsCode = async ({ fc }: { fc: number | string }, response: Response) => {
        try {
            return ResponseSender.result(response, 200, await this.userRepository.getUserByFriendsCode(fc))
        } catch (error: any) {
            return error instanceof NotFoundError
                ? this.userNotFoundError(response)
                : ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    createUser = async (
        { email, username, uid }: { email: string, username: string, uid: string },
        response: Response,
    ) => {
        try {
            await this.userRepository.checkUsernameAndMail(username, email)
            return ResponseSender.result(
                response,
                201,
                await this.userRepository.createUser({ email, uid, username }),
            )
        } catch (error: any) {
            switch (error.constructor) {
            case ValueAlreadyExistsError: {
                return ResponseSender.error(
                    response,
                    ValueAlreadyExistsError.getErrorDocument(error.message),
                )
            }
            case ForbiddenError: {
                return ResponseSender.error(response, ForbiddenError.getErrorDocument())
            }
            case NegativeNumbersNotAllowedError: {
                return ResponseSender.error(response, NegativeNumbersNotAllowedError.getErrorDocument())
            }
            case MaximumFriendsCodeLimitExceededError: {
                return ResponseSender.error(response, MaximumFriendsCodeLimitExceededError.getErrorDocument())
            }
            default: {
                return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
            }
            }
        }
    }

    updateMessageToken = async ({ token, uid }: { token: string, uid: string }, response: Response) => {
        try {
            await this.userRepository.updateMessageToken(uid, token)
            return response.sendStatus(204)
        } catch (error: any) {
            return error instanceof NotFoundError
                ? this.userNotFoundError(response)
                : ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    updateUser = async (
        { email, username, uid }: { email: string, username: string, uid: string },
        response: Response,
    ) => {
        // TODO: what if just one attribute has changed?
        // right now this would probably throw an error "Email or Username already taken"
        // this has to be done before FQ-275
        try {
            await this.userRepository.checkUsernameAndMail(username, email)
            const { user, points } = await this.userRepository.updateUser(uid, { username, email })
            return ResponseSender.result(response, 200, user, { amount: points, total: user.points })
        } catch (error: any) {
            switch (error.constructor) {
            case ValueAlreadyExistsError: {
                return ResponseSender.error(
                    response,
                    ValueAlreadyExistsError.getErrorDocument(error.message),
                )
            }
            case NotFoundError: {
                return this.userNotFoundError(response)
            }
            default: {
                return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
            }
            }
        }
    }

    deleteUser = async ({ uid }: { uid: string }, response: Response) => {
        try {
            await this.userRepository.deleteUser(uid)
            return response.sendStatus(204)
        } catch (error: any) {
            return error instanceof NotFoundError
                ? this.userNotFoundError(response)
                : ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }
}
