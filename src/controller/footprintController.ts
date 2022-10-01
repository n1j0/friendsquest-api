import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { $app } from '../$app'
import { FootprintReaction } from '../entities/footprintReaction'
import { AUTH_HEADER_UID } from '../constants/index'

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

        try {
            const footprint = await $app.footprintRepository.findOneOrFail({ id } as any)
            const user = await $app.userRepository.findOneOrFail({
                // eslint-disable-next-line security/detect-object-injection
                uid: request.headers[AUTH_HEADER_UID] as string,
            } as any)
            const reaction = new FootprintReaction(user, message, footprint)
            await $app.userRepository.persist(reaction)
        } catch (error: any) {
            return response.status(403).send({ message: error.message })
        }

        return response.sendStatus(204)
    }

    public createFootprint = async (request: Request, response: Response) => {
        if (!request.body.title && !request.body.latitude && !request.body.longitude && !request.body.createdBy) {
            return response.status(400).json({ message: 'Missing required fields' })
        }

        // TODO maybe reduce the size of the image ( or in the frontend )
        // TODO upload the image to firebase storage
        // get maybe compressed blob file --> upload to firebase storage --> get url --> save to db

        if (request.file) {
            const image = request.body.files.image[0]

            const storage = await $app.firebase.storage().ref('gs://friends-quest.appspot.com').upload(image, {
                public: true,
                destination: `/images/${uuidv4()}`,
                metadata: {
                    firebaseStorageDownloadTokens: uuidv4(),
                },
            })

            // Link to file
            console.log(storage[0].metadata.mediaLink)
            return response.status(201).json(storage[0].metadata.mediaLink)
        }

        try {
            const footprint = await $app.footprintRepository.create(request.body)
            return response.status(201).json(footprint)
        } catch (error: any) {
            return response.status(500).json({ message: error.message })
        }
    }
}
