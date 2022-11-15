import { Request, Response } from 'express'
import ErrorController from './errorController.js'
import { FootprintService } from '../services/footprintService.js'

export default class FootprintController {
    private footprintService: FootprintService

    constructor(footprintService: FootprintService) {
        this.footprintService = footprintService
    }

    public getAllFootprints = async (response: Response) => {
        try {
            return response.status(200).json(await this.footprintService.getAllFootprints())
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }

    public getFootprintById = async (request: Request, response: Response) => {
        try {
            const footprint = await this.footprintService.getFootprintById(request.params.id)
            if (footprint) {
                return response.status(200).json(footprint)
            }
            return ErrorController.sendError(response, 404, 'Footprint not found')
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }

    public getFootprintReactions = async (request: Request, response: Response) => {
        const { id: footprintId } = request.params
        if (!footprintId) {
            return ErrorController.sendError(response, 500, 'ID is missing')
        }
        try {
            return response.status(200).json(await this.footprintService.getFootprintReactions(footprintId))
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }

    public createFootprintReaction = async (request: Request, response: Response) => {
        const message = request.body.message.trim()
        if (!message) {
            return ErrorController.sendError(response, 500, 'Message is missing')
        }
        const { id } = request.params
        if (!id) {
            return ErrorController.sendError(response, 500, 'ID is missing')
        }

        try {
            const reaction = await this.footprintService.createFootprintReaction(request, id, message)
            const reactionWithFootprintId = {
                ...reaction,
                footprint: reaction.footprint.id,
            }
            return response.status(201).json(reactionWithFootprintId)
        } catch (error: any) {
            return ErrorController.sendError(response, 403, error)
        }
    }

    public createFootprint = async (request: Request, response: Response) => {
        if (!request.body.title && !request.body.latitude
            && !request.body.longitude && !request.body.createdBy && !request.body.files) {
            return ErrorController.sendError(response, 400, 'Missing required fields')
        }

        try {
            const footprint = await this.footprintService.createFootprint(request)
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
