import { Response } from 'express'
import ErrorController from './errorController.js'
import { FootprintRepositoryInterface } from '../repositories/footprint/footprintRepositoryInterface.js'
import { NewFootprint } from '../types/footprint'
import { NotFoundError } from '../errors/NotFoundError.js'
import { AttributeIsMissingError } from '../errors/AttributeIsMissingError.js'
import { InternalServerError } from '../errors/InternalServerError.js'
import ResponseController from './responseController.js'

export default class FootprintController {
    private footprintRepository: FootprintRepositoryInterface

    constructor(footprintRepository: FootprintRepositoryInterface) {
        this.footprintRepository = footprintRepository
    }

    getAllFootprints = async (response: Response) => {
        try {
            return ResponseController.sendResponse(response, 200, await this.footprintRepository.getAllFootprints())
        } catch (error: any) {
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    getFootprintsOfFriendsAndUser = async ({ uid }: { uid: string }, response: Response) => {
        try {
            return ResponseController.sendResponse(
                response,
                200,
                await this.footprintRepository.getFootprintsOfFriendsAndUser(uid),
            )
        } catch (error: any) {
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    getFootprintById = async ({ uid, id }: { uid: string, id: number | string }, response: Response) => {
        if (!id) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('ID'))
        }
        try {
            const { footprint, points, userPoints } = await this.footprintRepository.getFootprintById(uid, id)
            return ResponseController.sendResponse(response, 200, footprint, { amount: points, total: userPoints })
        } catch (error: any) {
            if (error instanceof NotFoundError) {
                return ErrorController.sendError(response, NotFoundError.getErrorDocument('The footprint'))
            }
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    getFootprintReactions = async ({ id }: { id: number | string }, response: Response) => {
        if (!id) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('ID'))
        }
        try {
            return ResponseController.sendResponse(
                response,
                200,
                await this.footprintRepository.getFootprintReactions(id),
            )
        } catch (error: any) {
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    createFootprintReaction = async (
        { id, message, uid }: { id: number | string, message: string, uid: string },
        response: Response,
    ) => {
        if (!message) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('Message'))
        }
        if (!id) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('ID'))
        }

        try {
            const { reaction, points, userPoints } = await this.footprintRepository.createFootprintReaction({
                id,
                message: message.trim(),
                uid,
            })
            const reactionWithFootprintId = {
                ...reaction,
                footprint: reaction.footprint.id,
            }
            return ResponseController.sendResponse(
                response,
                201,
                reactionWithFootprintId,
                { amount: points, total: userPoints },
            )
        } catch (error: any) {
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    createFootprint = async ({ title, latitude, longitude, files, uid }: NewFootprint, response: Response) => {
        if (!title || !latitude || !longitude || !files) {
            // TODO get error message for multiple fields
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('Required fields'))
        }

        try {
            const { footprint, points, userPoints } = await this.footprintRepository.createFootprint({
                title,
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
            return ResponseController.sendResponse(
                response,
                201,
                footprintWithCoordinatesAsNumbers,
                { amount: points, total: userPoints },
            )
        } catch (error: any) {
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }
}
