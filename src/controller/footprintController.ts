import { Express, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { $app } from '../$app.js'
import { FootprintReaction } from '../entities/footprintReaction.js'
import { Footprint } from '../entities/footprint.js'
import { AUTH_HEADER_UID } from '../constants/index.js'
import ErrorController from './errorController.js'

interface MulterFiles extends Express.Request {
    files: {
        image: Express.Multer.File[]
        audio: Express.Multer.File[]
    }
}

const createPersistentDownloadUrl = (
    bucket: any,
    pathToFile: string,
    downloadToken: string,
// eslint-disable-next-line max-len
) => `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(pathToFile)}?alt=media&token=${downloadToken}`

async function uploadFileToFirestorage(files: MulterFiles['files']) {
    const bucket = $app.storage.bucket('gs://friends-quest.appspot.com/')
    const fileName = uuidv4()

    const images: Express.Multer.File[] = files.image
    const audios: Express.Multer.File[] = files.audio

    const concatFiles = [ ...images, ...audios ]

    const promises = concatFiles.map((value: Express.Multer.File) => {
        const fullPath = () => {
            if ((value.mimetype === 'image/jpeg' || value.mimetype === 'image/png' || value.mimetype === 'image/jpg')
                && value.fieldname === 'image') {
                return `images/${fileName}.${value.mimetype.split('/')[1]}`
            }
            if ((value.mimetype === 'audio/mpeg' || value.mimetype === 'audio/mp3') && value.fieldname === 'audio') {
                return `audios/${fileName}.${value.mimetype.split('/')[1]}`
            }
            if (value.mimetype === 'video/mp4' && value.fieldname === 'video') {
                return `videos/${fileName}.${value.mimetype.split('/')[1]}`
            }
            return ''
        }

        const bucketFile = bucket.file(fullPath())

        const downloadToken = uuidv4()

        bucketFile.save(value.buffer, {
            metadata: {
                contentType: value.mimetype,
                downloadTokens: downloadToken,
            },
        })

        return createPersistentDownloadUrl(bucket.name, fullPath(), downloadToken)
    })

    // TODO: promises is a string array?!
    return Promise.all(promises)
}

export default class FootprintController {
    public getAllFootprints = async (response: Response) => {
        try {
            const footprints = await $app.footprintRepository.findAll({ populate: ['createdBy'] })
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
            $app.userRepository.persist(reaction)
            await $app.userRepository.flush()
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
            // TODO: why fork?
            const em = $app.em.fork()
            const user = await em.findOneOrFail('User', {
                // eslint-disable-next-line security/detect-object-injection
                uid: request.headers[AUTH_HEADER_UID] as string,
            } as any)
            const [ photoURL, audioURL ] = await uploadFileToFirestorage(request.files as MulterFiles['files'])
            const footprint = new Footprint(
                request.body.title,
                user,
                request.body.latitude,
                request.body.longitude,
                photoURL,
                audioURL,
            )
            em.persist(footprint)
            await em.flush()
            return response.status(201).json(footprint)
        } catch (error: any) {
            return ErrorController.sendError(response, 500, error)
        }
    }
}
