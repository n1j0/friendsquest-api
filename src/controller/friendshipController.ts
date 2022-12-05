import { Response } from 'express'
import ErrorController from './errorController.js'
import { FriendshipStatus } from '../constants/index.js'
import { FriendshipRepositoryInterface } from '../repositories/friendship/friendshipRepositoryInterface.js'
import { UserRepositoryInterface } from '../repositories/user/userRepositoryInterface.js'
import { AttributeIsMissingError } from '../errors/AttributeIsMissingError'
import { NotFoundError } from '../errors/NotFoundError.js'
import { ForbiddenError } from '../errors/ForbiddenError.js'
import { InternalServerError } from '../errors/InternalServerError.js'

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

    // TODO: refactor. hard to read
    private mapFriendshipsToObject = (friendships: any) => friendships.map((friendship: any) => ({
        id: friendship.fs_id,
        createdAt: friendship.fs_created_at,
        updatedAt: friendship.fs_updated_at,
        invitor: friendship.fs_invitor_id,
        invitee: friendship.fs_invitee_id,
        status: friendship.fs_status,
        friend: {
            id: friendship.id,
            createdAt: friendship.created_at,
            updatedAt: friendship.updated_at,
            username: friendship.username,
            email: friendship.email,
            uid: friendship.uid,
            imageURL: friendship.image_url,
            friendsCode: friendship.friends_code,
        },
    }))

    getFriendships = async ({ userId }: { userId: string }, response: Response) => {
        if (!userId) {
            return this.idNotFoundError(response)
        }
        const friendships = await this.friendshipRepository.getFriendships(userId)
        return response.status(200).json(this.mapFriendshipsToObject(friendships))
    }

    createFriendship = async ({ friendsCode, uid }: { friendsCode: string, uid: string }, response: Response) => {
        if (!friendsCode) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('FriendsCode'))
        }
        const [ invitor, invitee ] = await Promise.all([
            this.userRepository.getUserByUid(uid),
            this.userRepository.getUserByFriendsCode(friendsCode),
        ])

        if (!(invitor && invitee)) {
            return this.friendshipNotFoundError(response)
        }

        if (invitor.friendsCode === invitee.friendsCode) {
            return ErrorController.sendError(response, ForbiddenError.getErrorDocument('You can not add yourself.'))
        }

        try {
            await this.friendshipRepository.checkForExistingFriendship(invitor, invitee)
        } catch (error: any) {
            return error instanceof ForbiddenError
                ? ErrorController.sendError(response, ForbiddenError.getErrorDocument())
                : ErrorController.sendError(response, InternalServerError.getErrorDocument())
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
    }

    acceptFriendship = async ({ id, uid }: { id: number | string, uid: string }, response: Response) => {
        if (!id) {
            return this.idNotFoundError(response)
        }
        const friendship = await this.friendshipRepository.getFriendshipById(id)

        if (!friendship) {
            return this.friendshipNotFoundError(response)
        }

        if (friendship.invitee.uid !== uid) {
            return ErrorController.sendError(
                response,
                ForbiddenError.getErrorDocument('You are not allowed to accept this friendship.'),
            )
        }

        if (friendship.status === FriendshipStatus.ACCEPTED) {
            return ErrorController.sendError(response, ForbiddenError.getErrorDocument('Friendship already accepted.'))
        }

        try {
            await this.friendshipRepository.acceptFriendship(friendship)
            return response.status(200).json(friendship)
        } catch (error: any) {
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    declineOrDeleteFriendship = async ({ id, uid }: { id: number | string, uid: string }, response: Response) => {
        if (!id) {
            return this.idNotFoundError(response)
        }
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

        try {
            await this.friendshipRepository.declineOrDeleteExistingFriendship(friendship)
            return response.status(200).json('Friendship deleted')
        } catch (error: any) {
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }
}
