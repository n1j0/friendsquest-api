import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { $app } from '../$app.js'
import { FootprintReaction } from '../entities/footprintReaction.js'
import { AUTH_HEADER_UID } from '../constants/index.js'

// eslint-disable-next-line no-undef
async function uploadFileToFirestorage(data: Express.Multer.File, directory: string) {
    const fileName = uuidv4()
    const fullPath = `${directory}/${fileName}.${data.mimetype.split('/')[1]}`
    const bucket = $app.storage.bucket('gs://friends-quest.appspot.com/')

    const bucketFile = bucket.file(fullPath)

    console.log(data.buffer)
    await bucketFile.save(data.buffer, {
        metadata: {
            contentType: data.mimetype,
        },
    })
    const [url] = await bucketFile.getSignedUrl({
        action: 'read',
        expires: '01-01-2050',
    })

    return url
}

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
        /* if (!request.body.title && !request.body.latitude
            && !request.body.longitude && !request.body.createdBy && !request.body.file) {
            return response.status(400).json({ message: 'Missing required fields' })
        } */
        if (!request.file) {
            return response.status(400).json({ message: 'Missing required fields' })
        }

        try {
            /* const footprint = await $app.footprintRepository.create()
            await $app.footprintRepository.persist(footprint) */
            // eslint-disable-next-line no-undef
            const photoURL = await uploadFileToFirestorage(request.file as Express.Multer.File, 'images')
            return response.status(201).json({ message: photoURL })
        } catch (error: any) {
            return response.status(500).json({ message: error.message })
        }
    }
}
