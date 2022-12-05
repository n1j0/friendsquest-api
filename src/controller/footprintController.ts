import { Response } from 'express'
import ErrorController from './errorController.js'
import { FootprintRepositoryInterface } from '../repositories/footprint/footprintRepositoryInterface.js'
import { NewFootprint } from '../types/footprint'
import { NotFoundError } from '../errors/NotFoundError.js'
import { AttributeIsMissingError } from '../errors/AttributeIsMissingError'
import { InternalServerError } from '../errors/InternalServerError.js'

export default class FootprintController {
    private footprintRepository: FootprintRepositoryInterface

    constructor(footprintRepository: FootprintRepositoryInterface) {
        this.footprintRepository = footprintRepository
    }

    getAllFootprints = async (response: Response) => {
        try {
            return response.status(200).json(await this.footprintRepository.getAllFootprints())
        } catch (error: any) {
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }

    getFootprintById = async ({ uid, id }: { uid: string, id: number | string }, response: Response) => {
        if (!id) {
            return ErrorController.sendError(response, AttributeIsMissingError.getErrorDocument('ID'))
        }
        try {
            const footprint = await this.footprintRepository.getFootprintById(uid, id)
            return response.status(200).json(footprint)
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
            return response.status(200).json(await this.footprintRepository.getFootprintReactions(id))
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
            const reaction = await this.footprintRepository.createFootprintReaction({
                id,
                message: message.trim(),
                uid,
            })
            const reactionWithFootprintId = {
                ...reaction,
                footprint: reaction.footprint.id,
            }
            return response.status(201).json(reactionWithFootprintId)
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
            const footprint = await this.footprintRepository.createFootprint({
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
            return response.status(201).json(footprintWithCoordinatesAsNumbers)
        } catch (error: any) {
            return ErrorController.sendError(response, InternalServerError.getErrorDocument(error.message))
        }
    }
}
