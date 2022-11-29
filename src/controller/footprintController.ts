import { Response } from 'express'
import ErrorController from './errorController.js'
import { FootprintRepositoryInterface } from '../repositories/footprint/footprintRepositoryInterface.js'
import { NewFootprint } from '../types/footprint'

export default class FootprintController {
    private footprintRepository: FootprintRepositoryInterface

    constructor(footprintRepository: FootprintRepositoryInterface) {
        this.footprintRepository = footprintRepository
    }

    public getAllFootprints = async (response: Response) => {
        try {
            return response.status(200).json(await this.footprintRepository.getAllFootprints())
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }

    public getFootprintById = async ({ id }: { id: number | string }, response: Response) => {
        if (!id) {
            return ErrorController.sendError(response, 500, 'ID is missing')
        }
        try {
            const footprint = await this.footprintRepository.getFootprintById(id)
            if (footprint) {
                return response.status(200).json(footprint)
            }
            return ErrorController.sendError(response, 404, 'Footprint not found')
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }

    public getFootprintReactions = async ({ id }: { id: number | string }, response: Response) => {
        if (!id) {
            return ErrorController.sendError(response, 500, 'ID is missing')
        }
        try {
            return response.status(200).json(await this.footprintRepository.getFootprintReactions(id))
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }

    public createFootprintReaction = async (
        { id, message, uid }: { id: number | string, message: string, uid: string },
        response: Response,
    ) => {
        if (!message) {
            return ErrorController.sendError(response, 500, 'Message is missing')
        }
        if (!id) {
            return ErrorController.sendError(response, 500, 'ID is missing')
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
            return ErrorController.sendError(response, 500, error)
        }
    }

    public createFootprint = async ({ title, latitude, longitude, files, uid }: NewFootprint, response: Response) => {
        if (!title || !latitude || !longitude || !files) {
            return ErrorController.sendError(response, 400, 'Missing required fields')
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
            return ErrorController.sendError(response, 500, error)
        }
    }
}
