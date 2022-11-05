import { Express, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { $app } from '../$app.js'
import { FootprintReaction } from '../entities/footprintReaction.js'
import { Footprint } from '../entities/footprint.js'
import { AUTH_HEADER_UID } from '../constants/index.js'
import ErrorController from './errorController.js'
import { fullPath } from '../services/footprintService.js'

interface MulterFiles extends Express.Request {
    files: {
        image: Express.Multer.File[]
        audio: Express.Multer.File[]
    }
}

const createPersistentDownloadUrl = (
    bucket: string,
    pathToFile: string,
    downloadToken: string,
// eslint-disable-next-line max-len
) => `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(pathToFile)}?alt=media&token=${downloadToken}`

async function uploadFilesToFirestorage(files: MulterFiles['files']) {
    const bucket = $app.storage.bucket('gs://friends-quest.appspot.com/')
    const images: Express.Multer.File[] = files.image
    const audios: Express.Multer.File[] = files.audio
    const concatFiles = [ ...images, ...audios ]
    const promises: Promise<void>[] = []

    const downloadURLs = concatFiles.map((value: Express.Multer.File) => {
        const fileName = uuidv4()
        const bucketFile = bucket.file(fullPath(value, fileName))
        const downloadToken = uuidv4()

        promises.push(bucketFile.save(value.buffer, {
            metadata: {
                contentType: value.mimetype,
                downloadTokens: downloadToken,
            },
        }))

        return createPersistentDownloadUrl(bucket.name, fullPath(value, fileName), downloadToken)
    })

    await Promise.all(promises)

    return downloadURLs
}

export default class FootprintController {
    public getAllFootprints = async (response: Response) => {
        try {
            const em = $app.em.fork()
            const footprints = await em.getRepository('Footprint').findAll({ populate: ['createdBy'] } as any)
            return response.status(200).json(footprints)
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }

    // TODO: should getFootprint include the reactions?
    // TODO: every time this is called the viewCount needs to be increased
    public getFootprintById = async (request: Request, response: Response) => {
        try {
            const em = $app.em.fork()
            const footprint = await em.findOne('Footprint', { id: request.params.id } as any)
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
            const em = $app.em.fork()
            const footprints = await em.findOneOrFail('FootprintReaction', { footprint: footprintId } as any)
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
            const em = $app.em.fork()
            const footprint = await em.findOneOrFail('Footprint', { id } as any)
            const user = await em.findOneOrFail('User', {
                // eslint-disable-next-line security/detect-object-injection
                uid: request.headers[AUTH_HEADER_UID] as string,
            } as any)
            const reaction = new FootprintReaction(user, message, footprint)
            await em.persistAndFlush(reaction)
        } catch (error: any) {
            return ErrorController.sendError(response, 403, error)
        }

        return response.sendStatus(204)
    }

    public createFootprint = async (request: Request, response: Response) => {
        if (!request.body.title && !request.body.latitude
            && !request.body.longitude && !request.body.createdBy && !request.body.files) {
            return ErrorController.sendError(response, 400, 'Missing required fields')
        }

        try {
            const em = $app.em.fork()
            const user = await em.findOneOrFail('User', {
                // eslint-disable-next-line security/detect-object-injection
                uid: request.headers[AUTH_HEADER_UID] as string,
            } as any)
            const [ photoURL, audioURL ] = await uploadFilesToFirestorage(request.files as MulterFiles['files'])
            const footprint = new Footprint(
                request.body.title,
                user,
                request.body.latitude,
                request.body.longitude,
                photoURL,
                audioURL,
            )
            await em.persistAndFlush(footprint)
            return response.status(201).json(footprint)
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }
}
