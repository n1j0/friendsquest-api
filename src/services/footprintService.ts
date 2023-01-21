import Multer from 'multer'
import { Express, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getStorage, Storage } from 'firebase-admin/storage'
import fetch from 'node-fetch'
import { MulterFiles } from '../types/multer.js'

export class FootprintService {
    readonly storage: Storage

    constructor(storage: Storage = getStorage()) {
        this.storage = storage
    }

    fullPath = (value: Express.Multer.File, fileName: string, uid: string): string => {
        const path = `/${uid}/${fileName}.${value.mimetype.split('/')[1]}`
        if ((value.mimetype === 'image/jpeg' || value.mimetype === 'image/png' || value.mimetype === 'image/jpg')
            && value.fieldname === 'image') {
            return `images${path}`
        }
        if ((value.mimetype === 'audio/mpeg' || value.mimetype === 'audio/mp3' || value.mimetype === 'audio/aac'
            || value.mimetype === 'audio/wav') && value.fieldname === 'audio') {
            return `audios${path}`
        }
        if (value.mimetype === 'video/mp4' && value.fieldname === 'video') {
            return `videos${path}`
        }
        return ''
    }

    createPersistentDownloadUrl = (
        bucket: string,
        pathToFile: string,
        downloadToken: string,
        // eslint-disable-next-line max-len
    ) => `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(pathToFile)}?alt=media&token=${downloadToken}`

    uploadFilesToFireStorage = async (files: MulterFiles['files'], uid: string) => {
        const bucket = this.storage.bucket()
        const images: Express.Multer.File[] = files.image
        const audios: Express.Multer.File[] = files.audio
        const allFiles = [ ...images, ...audios ]
        const promises: Promise<void>[] = []

        const downloadURLs = allFiles.map((value: Express.Multer.File) => {
            const fileName = uuidv4()
            const fullPath = this.fullPath(value, fileName, uid)
            const bucketFile = bucket.file(fullPath)
            const downloadToken = uuidv4()

            promises.push(bucketFile.save(value.buffer, {
                metadata: {
                    contentType: value.mimetype,
                    downloadTokens: downloadToken,
                },
                gzip: true,
            }))

            return this.createPersistentDownloadUrl(bucket.name, fullPath, downloadToken)
        })

        await Promise.all(promises)

        return downloadURLs
    }

    getTemperature = async (latitude: string, longitude: string): Promise<unknown | undefined> => {
        // eslint-disable-next-line max-len
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`)
        return await response.json() as unknown as Promise<unknown | undefined>
    }

    uploadMiddleware = Multer({
        fileFilter(request: Request, file: Express.Multer.File, callback: Multer.FileFilterCallback) {
            if (file.mimetype === 'image/jpeg'
                || file.mimetype === 'image/png'
                || file.mimetype === 'image/jpg'
                || file.mimetype === 'audio/aac'
                || file.mimetype === 'audio/wav'
                || file.mimetype === 'audio/mpeg'
                || file.mimetype === 'audio/mp3'
                || file.mimetype === 'video/mp4') {
                // eslint-disable-next-line unicorn/no-null
                callback(null, true)
            } else {
                callback(new Error('Type of file is not supported'))
            }
        },
    })
}
