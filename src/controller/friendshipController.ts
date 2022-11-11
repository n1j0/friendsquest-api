import { Request, Response } from 'express'
import { $app } from '../$app.js'
import ErrorController from './errorController.js'
import { AUTH_HEADER_UID } from '../constants/index.js'
import { Friendship } from '../entities/friendship.js'

export default class FriendshipController {
    private friendshipNotFoundError = (response: Response) => {
        ErrorController.sendError(response, 404, 'Friendship not found')
    }

    private idNotFoundError = (response: Response) => {
        ErrorController.sendError(response, 500, 'Missing id')
    }

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

    public getFriendships = async (request: Request, response: Response) => {
        const { userId } = request.query
        if (!userId) {
            return this.idNotFoundError(response)
        }
        const em = $app.em.fork()
        const connection = em.getConnection()
        // eslint-disable-next-line max-len
        const results = await connection.execute(`SELECT f1.id as fs_id, f1.created_at as fs_created_at, f1.updated_at as fs_updated_at, f1.invitor_id as fs_invitor_id, f1.invitee_id as fs_invitee_id, f1.status as fs_status, f2.*  FROM (select "f0".* from "friendship" as "f0" where ("f0"."invitee_id" = ${userId} or "f0"."invitor_id" = ${userId})) f1 LEFT JOIN (SELECT *  FROM public.user WHERE id IN ( SELECT (CASE WHEN f.invitor_id != ${userId} THEN f.invitor_id ELSE f.invitee_id END) AS friend FROM (SELECT t.* FROM public.friendship t WHERE (t.invitor_id = ${userId} OR t.invitee_id = ${userId})) AS f)) as f2 ON (f1.invitee_id = f2.id OR f1.invitor_id = f2.id)`)
        return response.status(200).json(this.mapFriendshipToObject(results))
    }

    public createFriendship = async (request: Request, response: Response) => {
        const { friendsCode } = request.body
        const uid = request.headers[AUTH_HEADER_UID] as string
        if (!friendsCode) {
            return ErrorController.sendError(response, 403, 'Missing friendsCode')
        }
        const em = $app.em.fork()
        const invitor = await em.findOne('User', { uid } as any)
        const invitee = await em.findOne('User', { friendsCode } as any)

        if (invitor.friendsCode === invitee.friendsCode) {
            return ErrorController.sendError(response, 403, 'You can not add yourself')
        }

        const checkInvitorFriendship = await em.find('Friendship', { invitor, invitee } as any)
        const checkInviteeFriendship = await em.find('Friendship', { invitee: invitor, invitor: invitee } as any)

        if (invitor && invitee) {
            if (checkInvitorFriendship.length > 0 || checkInviteeFriendship.length > 0) {
                return ErrorController.sendError(response, 403, 'Friendship already exists')
            }
            const friendship = new Friendship(invitor, invitee)
            await em.persistAndFlush(friendship)
            const friendshipObjectToReturn = {
                id: friendship.id,
                createdAt: friendship.createdAt,
                updatedAt: friendship.updatedAt,
                invitor: friendship.invitor.id,
                invitee: friendship.invitee.id,
                status: friendship.status,
                friend: { ...invitee },
            }
            return response.status(200).json(friendshipObjectToReturn)
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
                return response.status(200).json('Friendship deleted')
            }
            return ErrorController.sendError(response, 403, 'You are not allowed to delete this friendship')
        }
        return this.friendshipNotFoundError(response)
    }
}
