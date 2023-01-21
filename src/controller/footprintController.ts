import { Response } from 'express'
import { FootprintRepositoryInterface } from '../repositories/footprint/footprintRepositoryInterface.js'
import { NewFootprint } from '../types/footprint'
import { NotFoundError } from '../errors/NotFoundError.js'
import { InternalServerError } from '../errors/InternalServerError.js'
import ResponseSender from '../helper/responseSender.js'
import { ForbiddenError } from '../errors/ForbiddenError'

export default class FootprintController {
    private footprintRepository: FootprintRepositoryInterface

    constructor(footprintRepository: FootprintRepositoryInterface) {
        this.footprintRepository = footprintRepository
    }

    getAllFootprints = async (response: Response) => {
        try {
            return ResponseSender.result(response, 200, await this.footprintRepository.getAllFootprints())
        } catch (error: any) {
            return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    getFootprintsOfFriendsAndUser = async ({ uid }: { uid: string }, response: Response) => {
        try {
            return ResponseSender.result(
                response,
                200,
                await this.footprintRepository.getFootprintsOfFriendsAndUser(uid),
            )
        } catch (error: any) {
            return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    getFootprintById = async ({ uid, id }: { uid: string, id: number | string }, response: Response) => {
        try {
            const { footprint, points, userPoints } = await this.footprintRepository.getFootprintById(uid, id)
            return ResponseSender.result(response, 200, footprint, { amount: points, total: userPoints })
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return ResponseSender.error(response, NotFoundError.getErrorDocument('The footprint'))
            }
            return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    getFootprintReactions = async ({ id }: { id: number | string }, response: Response) => {
        try {
            return ResponseSender.result(
                response,
                200,
                await this.footprintRepository.getFootprintReactions(id),
            )
        } catch (error: any) {
            return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    createFootprintReaction = async (
        { id, message, uid }: { id: number | string, message: string, uid: string },
        response: Response,
    ) => {
        try {
            const { reaction, points, userPoints } = await this.footprintRepository.createFootprintReaction({
                id,
                message,
                uid,
            })
            const reactionWithFootprintId = {
                ...reaction,
                footprint: reaction.footprint.id,
            }
            return ResponseSender.result(
                response,
                201,
                reactionWithFootprintId,
                { amount: points, total: userPoints },
            )
        } catch (error: any) {
            return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    deleteFootprint = async ({ id, uid }: { id: number | string, uid: string }, response: Response) => {
        try {
            await this.footprintRepository.deleteFootprint({ id, uid })
            return response.sendStatus(204)
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return ResponseSender.error(response, NotFoundError.getErrorDocument('The footprint'))
            }
            if (error instanceof ForbiddenError) {
                // eslint-disable-next-line max-len
                return ResponseSender.error(response, ForbiddenError.getErrorDocument('You cannot delete footprints of others'))
            }
            return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    deleteFootprintReaction = async ({ id, uid }: { id: number | string, uid: string }, response: Response) => {
        try {
            await this.footprintRepository.deleteFootprintReaction({ id, uid })
            return response.sendStatus(204)
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return ResponseSender.error(response, NotFoundError.getErrorDocument('The reaction'))
            }
            if (error instanceof ForbiddenError) {
                // eslint-disable-next-line max-len
                return ResponseSender.error(response, ForbiddenError.getErrorDocument('You cannot delete reactions of others'))
            }
            return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    createFootprint = async (
        { title, description, latitude, longitude, files, uid }: NewFootprint,
        response: Response,
    ) => {
        try {
            const { footprint, points, userPoints } = await this.footprintRepository.createFootprint({
                title,
                description,
                latitude,
                longitude,
                files,
                uid,
            })
            const footprintWithCoordinatesAsNumbers = {
                ...footprint,
                longitude: Number(footprint.longitude),
                latitude: Number(footprint.latitude),
            }

            return ResponseSender.result(
                response,
                201,
                footprintWithCoordinatesAsNumbers,
                { amount: points, total: userPoints },
            )
        } catch (error: any) {
            return ResponseSender.error(response, InternalServerError.getErrorDocument(error.message))
        }
    }
}
