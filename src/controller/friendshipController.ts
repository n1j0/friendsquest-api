import { Request, Response } from 'express'
import ErrorController from './errorController.js'
import { AUTH_HEADER_UID, FriendshipStatus } from '../constants/index.js'
import { FriendshipRepositoryInterface } from '../repositories/friendship/friendshipRepositoryInterface.js'
import { UserRepositoryInterface } from '../repositories/user/userRepositoryInterface.js'

export default class FriendshipController {
    private friendshipRepository: FriendshipRepositoryInterface

    private userRepository: UserRepositoryInterface

    constructor(friendshipRepository: FriendshipRepositoryInterface, userRepository: UserRepositoryInterface) {
        this.friendshipRepository = friendshipRepository
        this.userRepository = userRepository
    }

    private friendshipNotFoundError = (response: Response) => {
        ErrorController.sendError(response, 404, 'Friendship not found')
    }

    private idNotFoundError = (response: Response) => {
        ErrorController.sendError(response, 500, 'Missing id')
    }

    // TODO: refactor. hard to read
    private mapFriendshipToObject = (friendship: any) => friendship.map((f: any) => {
        const fs = {
            id: f.fs_id,
            createdAt: f.fs_created_at,
            updatedAt: f.fs_updated_at,
            invitor: f.fs_invitor_id,
            invitee: f.fs_invitee_id,
            status: f.fs_status,
        }
        const friend = {
            id: f.id,
            createdAt: f.created_at,
            updatedAt: f.updated_at,
            username: f.username,
            email: f.email,
            uid: f.uid,
            imageURL: f.image_url,
            friendsCode: f.friends_code,
        }
        return {
            ...fs,
            friend,
        }
    })

    getFriendships = async (request: Request, response: Response) => {
        let { userId } = request.query
        userId = String(userId)
        if (!userId) {
            return this.idNotFoundError(response)
        }
        const friendships = await this.friendshipRepository.getFriendships(userId)
        return response.status(200).json(this.mapFriendshipToObject(friendships))
    }

    createFriendship = async (request: Request, response: Response) => {
        const { friendsCode } = request.body
        const uid = request.headers[AUTH_HEADER_UID] as string
        if (!friendsCode) {
            return ErrorController.sendError(response, 403, 'Missing friendsCode')
        }
        const [ invitor, invitee ] = await Promise.all([
            this.userRepository.getUserByUid(uid),
            this.userRepository.getUserByFriendsCode(friendsCode),
        ])

        if (!invitor || !invitee) {
            return this.friendshipNotFoundError(response)
        }

        if (invitor.friendsCode === invitee.friendsCode) {
            return ErrorController.sendError(response, 403, 'You can not add yourself')
        }

        try {
            await this.friendshipRepository.checkForExistingFriendship(invitor, invitee)
        } catch {
            return ErrorController.sendError(response, 403, 'Friendship already exists')
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

    acceptFriendship = async (request: Request, response: Response) => {
        const { id } = request.params
        const uid = request.headers[AUTH_HEADER_UID] as string
        if (!id) {
            return this.idNotFoundError(response)
        }
        const friendship = await this.friendshipRepository.getFriendshipById(id)

        if (!friendship) {
            return this.friendshipNotFoundError(response)
        }

        if (friendship.invitee.uid !== uid) {
            return ErrorController.sendError(response, 403, 'You are not allowed to accept this friendship')
        }

        if (friendship.status === FriendshipStatus.ACCEPTED) {
            return ErrorController.sendError(response, 403, 'Friendship already accepted')
        }

        try {
            await this.friendshipRepository.acceptFriendship(friendship)
            return response.status(200).json(friendship)
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }

    declineOrDeleteFriendship = async (request: Request, response: Response) => {
        const { id } = request.params
        const uid = request.headers[AUTH_HEADER_UID] as string
        if (!id) {
            return this.idNotFoundError(response)
        }
        const friendship = await this.friendshipRepository.getFriendshipById(id)

        if (!friendship) {
            return this.friendshipNotFoundError(response)
        }

        if (friendship.invitor.uid !== uid && friendship.invitee.uid !== uid) {
            return ErrorController.sendError(response, 403, 'You are not allowed to decline or delete this friendship')
        }

        try {
            await this.friendshipRepository.declineOrDeleteExistingFriendship(friendship)
            return response.status(200).json('Friendship deleted')
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }
}
