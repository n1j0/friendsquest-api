import { Response } from 'express'
import ErrorController from './errorController.js'
import { FriendshipStatus } from '../constants/index.js'
import { FriendshipRepositoryInterface } from '../repositories/friendship/friendshipRepositoryInterface.js'
import { UserRepositoryInterface } from '../repositories/user/userRepositoryInterface.js'
import { AttributeIsMissingError } from '../errors/AttributeIsMissingError.js'
import { NotFoundError } from '../errors/NotFoundError.js'
import { ForbiddenError } from '../errors/ForbiddenError.js'
import { InternalServerError } from '../errors/InternalServerError.js'
import { FriendshipAlreadyExistsError } from '../errors/FriendshipAlreadyExistsError.js'

export default class FriendshipController {
    private friendshipRepository: FriendshipRepositoryInterface

    private userRepository: UserRepositoryInterface

    constructor(friendshipRepository: FriendshipRepositoryInterface, userRepository: UserRepositoryInterface) {
        this.friendshipRepository = friendshipRepository
        this.userRepository = userRepository
    }

    private friendshipNotFoundError = (response: Response) => {
        ErrorController.sendError(response, NotFoundError.getErrorDocument('The friendship'))
    }

    private idNotFoundError = (response: Response) => {
        ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('ID'))
    }

    getFriendshipsByUid = async ({ userId }: { userId: string }, response: Response) => {
        if (!userId) {
            return this.idNotFoundError(response)
        }
        try {
            return response.status(200).json(await this.friendshipRepository.getFriendshipsByUid(userId))
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return this.friendshipNotFoundError(response)
            }
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    createFriendship = async ({ friendsCode, uid }: { friendsCode: string, uid: string }, response: Response) => {
        if (!friendsCode) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('FriendsCode'))
        }
        try {
            const [ invitor, invitee ] = await Promise.all([
                this.userRepository.getUserByUid(uid),
                this.userRepository.getUserByFriendsCode(friendsCode),
            ])

            if (invitor.friendsCode === invitee.friendsCode) {
                return ErrorController.sendError(response, ForbiddenError.getErrorDocument('You can not add yourself.'))
            }

            try {
                await this.friendshipRepository.checkForExistingFriendship(invitor, invitee)
            } catch (error: any) {
                return error instanceof FriendshipAlreadyExistsError
                    ? ErrorController.sendError(response, ForbiddenError.getErrorDocument('Friendship already exists.'))
                    : ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
            }

            const friendship = await this.friendshipRepository.createFriendship(invitor, invitee)

            const friendshipWithFriendData = {
                id: friendship.id,
                createdAt: friendship.createdAt,
                updatedAt: friendship.updatedAt,
                invitor: friendship.invitor.id,
                invitee: friendship.invitee.id,
                status: friendship.status,
                friend: { ...invitee },
            }
            return response.status(200).json(friendshipWithFriendData)
        } catch (error: any) {
            return error instanceof NotFoundError
                ? this.friendshipNotFoundError(response)
                : ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    acceptFriendship = async ({ id, uid }: { id: number | string, uid: string }, response: Response) => {
        if (!id) {
            return this.idNotFoundError(response)
        }
        try {
            const friendship = await this.friendshipRepository.getFriendshipById(id)

            if (friendship.invitee.uid !== uid) {
                return ErrorController.sendError(
                    response,
                    ForbiddenError.getErrorDocument('You are not allowed to accept this friendship.'),
                )
            }

            if (friendship.status === FriendshipStatus.ACCEPTED) {
                return ErrorController.sendError(
                    response,
                    ForbiddenError.getErrorDocument('Friendship already accepted.'),
                )
            }

            try {
                const { invitor, invitee } = await this.friendshipRepository.acceptFriendship(friendship)
                const friendshipWithUpdatedUserPoints = {
                    ...friendship,
                    invitor,
                    invitee,
                }
                return response.status(200).json(friendshipWithUpdatedUserPoints)
            } catch (error: any) {
                return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
            }
        } catch (error: any) {
            return error instanceof NotFoundError
                ? this.friendshipNotFoundError(response)
                : ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    declineOrDeleteFriendship = async ({ id, uid }: { id: number | string, uid: string }, response: Response) => {
        if (!id) {
            return this.idNotFoundError(response)
        }
        try {
            const friendship = await this.friendshipRepository.getFriendshipById(id)

            if (!friendship) {
                return this.friendshipNotFoundError(response)
            }

            if (friendship.invitor.uid !== uid && friendship.invitee.uid !== uid) {
                return ErrorController.sendError(
                    response,
                    ForbiddenError.getErrorDocument('You are not allowed to decline or delete this friendship.'),
                )
            }
            await this.friendshipRepository.declineOrDeleteExistingFriendship(friendship)
            return response.sendStatus(204)
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return this.friendshipNotFoundError(response)
            }
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }
}
