import { Request, Response } from 'express'
import { $app } from '../application.js'

export default class FootprintController {
    public getAllFootprints = async (response: Response) => {
        try {
            const footprints = await $app.footprintRepository.findAll()
            return response.status(200).json(footprints)
        } catch (error: any) {
            return response.status(500).json({ message: error.message })
        }
    }

    public getFootprintById = async (request: Request, response: Response) => {
        try {
            const footprint = await $app.footprintRepository.findOne({ id: request.params.id } as any)
            if (footprint) {
                return response.status(200).json(footprint)
            }
            return response.status(404).json({ message: 'Footprint not found' })
        } catch (error: any) {
            return response.status(500).json({ message: error.message })
        }
    }

    public getFootprintReactions = async (request: Request, response: Response) => {
        const footprintId = request.params.id
        if (!footprintId) {
            return response.status(500).json({ message: 'ID is missing' })
        }
        try {
            const footprints = await $app.footprintReactionRepository.findOneOrFail({ footprint: footprintId } as any)
            return response.status(200).json(footprints)
        } catch (error: any) {
            return response.status(500).json({ message: error.message })
        }
    }

    public createFootprintReaction = async (request: Request, response: Response) => {
        const message = request.body.message.trim()
        if (!message) {
            return response.status(500).json({ message: 'Message is missing' })
        }
        const { id } = request.params
        if (!id) {
            return response.status(500).json({ message: 'ID is missing' })
        }

        // TODO user information needs to be added
        /*
        const footprint = await $app.footprintRepository.findOne({ id } as any)
        const reaction = new FootprintReaction(user, message, footprint)
        await $app.userRepository.persist(user)
         */
        return response.sendStatus(204)
    }
}
