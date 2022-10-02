import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { $app } from '../$app.js'
import { FootprintReaction } from '../entities/footprintReaction.js'
import { AUTH_HEADER_UID } from '../constants/index.js'
import ErrorController from './errorController'

// eslint-disable-next-line no-undef
async function uploadFileToFirestorage(data: Express.Multer.File[]) {
    const bucket = $app.storage.bucket('gs://friends-quest.appspot.com/')

    const promises = data.map((file) => {
        const fileName = uuidv4()

        const fullPath = () => {
            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
                return `images/${fileName}.${file.mimetype.split('/')[1]}`
            }
            if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
                return `audios/${fileName}.${file.mimetype.split('/')[1]}`
            }
            return `videos/${fileName}.${file.mimetype.split('/')[1]}`
        }

        const bucketFile = bucket.file(fullPath())
        console.log(file.mimetype)
        bucketFile.save(file.buffer, {
            metadata: {
                contentType: file.mimetype,
            },
        })

        return bucketFile.getSignedUrl({
            action: 'read',
            expires: '01-01-2050',
        })
    })
    return Promise.all(promises)
}

export default class FootprintController {
    public getAllFootprints = async (response: Response) => {
        try {
            const footprints = await $app.footprintRepository.findAll()
            return response.status(200).json(footprints)
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }

    public getFootprintById = async (request: Request, response: Response) => {
        try {
            const footprint = await $app.footprintRepository.findOne({ id: request.params.id } as any)
            if (footprint) {
                return response.status(200).json(footprint)
            }
            return ErrorController.sendError(response, 404, 'Footprint not found')
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }

    public getFootprintReactions = async (request: Request, response: Response) => {
        const footprintId = request.params.id
        if (!footprintId) {
            return ErrorController.sendError(response, 500, 'ID is missing')
        }
        try {
            const footprints = await $app.footprintReactionRepository.findOneOrFail({ footprint: footprintId } as any)
            return response.status(200).json(footprints)
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
            const footprint = await $app.footprintRepository.findOneOrFail({ id } as any)
            const user = await $app.userRepository.findOneOrFail({
                // eslint-disable-next-line security/detect-object-injection
                uid: request.headers[AUTH_HEADER_UID] as string,
            } as any)
            const reaction = new FootprintReaction(user, message, footprint)
            await $app.userRepository.persist(reaction)
        } catch (error: any) {
            return ErrorController.sendError(response, 403, error)
        }

        return response.sendStatus(204)
    }

    public createFootprint = async (request: Request, response: Response) => {
        /* if (!request.body.title && !request.body.latitude
            && !request.body.longitude && !request.body.createdBy && !request.body.file) {
            return response.status(400).json({ message: 'Missing required fields' })
        } */
        if (!request.file) {
            return ErrorController.sendError(response, 400, 'Missing required fields')
        }

        try {
            /* const footprint = await $app.footprintRepository.create()
            await $app.footprintRepository.persist(footprint) */
            // eslint-disable-next-line no-undef
            const [ videoURL, audioURL ] = await uploadFileToFirestorage(request.files as Express.Multer.File[])

            // TODO store to db
            return response.status(201).json({ videoURL, audioURL })
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }
}
