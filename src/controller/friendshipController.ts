import { Request, Response } from 'express'
import { $app } from '../$app.js'
import ErrorController from './errorController.js'
import { AUTH_HEADER_UID } from '../constants/index.js'

export default class FriendshipController {
    private friendshipNotFoundError = (response: Response) => {
        ErrorController.sendError(response, 404, 'Friendship not found')
    }

    private idNotFoundError = (response: Response) => {
        ErrorController.sendError(response, 500, 'Missing id')
    }

    public getFriendships = async (request: Request, response: Response) => {
        const id = request.query.userId
        if (!id) {
            return this.idNotFoundError(response)
        }
        const em = $app.em.fork()
        const user = await em.findOne('User', { id } as any, { populate:
                [ 'friendships.invitor', 'friendships.invitee' ] })
        if (user) {
            return response.status(200).json(user.friendships)
        }
        return this.friendshipNotFoundError(response)
    }

    // TODO: Check if friendship already exists
    // TODO: Check if status is already accepted
    public createFriendship = async (request: Request, response: Response) => {
        const { friendsCode } = request.body
        const uid = request.headers[AUTH_HEADER_UID] as string
        if (!friendsCode) {
            return ErrorController.sendError(response, 403, 'Missing friendsCode')
        }
        const em = $app.em.fork()
        const invitor = await em.findOne('User', { uid } as any)
        const invitee = await em.findOne('User', { friendsCode } as any)

        console.log(invitor, invitee)

        if (invitor.friendsCode === invitee.friendsCode) {
            return ErrorController.sendError(response, 403, 'You can not add yourself')
        }

        const checkInvitorFriendship = await em.find('Friendship', { invitor, invitee } as any)
        const checkInviteeFriendship = await em.find('Friendship', { invitee: invitor, invitor: invitee } as any)

        if (invitor && invitee) {
            if (checkInvitorFriendship.length > 0 || checkInviteeFriendship.length > 0) {
                return ErrorController.sendError(response, 403, 'Friendship already exists')
            }
            const friendship = em.create('Friendship', {
                invitor,
                invitee,
            })
            await em.persistAndFlush(friendship)
            return response.status(200).json(friendship)
        }
        return this.friendshipNotFoundError(response)
    }

    public updateFriendship = async (request: Request, response: Response) => {
        const { id } = request.params
        const uid = request.headers[AUTH_HEADER_UID] as string
        const { status } = request.body
        if (!id) {
            return this.idNotFoundError(response)
        }
        const em = $app.em.fork()
        const friendship = await em.findOne('Friendship', { id } as any, { populate: [ 'invitor', 'invitee' ] })
        if (friendship) {
            if (friendship.invitor.uid === uid || friendship.invitee.uid === uid) {
                if (friendship.status === 'accepted') {
                    return ErrorController.sendError(response, 403, 'Friendship already accepted')
                }
                friendship.status = status
                await em.persistAndFlush(friendship)
                return response.status(200).json(friendship)
            }
            return ErrorController.sendError(response, 403, 'You are not allowed to update this friendship')
        }
        return this.friendshipNotFoundError(response)
    }

    public deleteFriendship = async (request: Request, response: Response) => {
        const { id } = request.params
        const uid = request.headers[AUTH_HEADER_UID] as string
        if (!id) {
            return this.idNotFoundError(response)
        }
        const em = $app.em.fork()
        const friendship = await em.findOne('Friendship', { id } as any, { populate: [ 'invitor', 'invitee' ] })
        if (friendship) {
            if (friendship.invitor.uid === uid || friendship.invitee.uid === uid) {
                await em.removeAndFlush(friendship)
                return response.status(200).json(friendship)
            }
            return ErrorController.sendError(response, 403, 'You are not allowed to delete this friendship')
        }
        return this.friendshipNotFoundError(response)
    }
}
