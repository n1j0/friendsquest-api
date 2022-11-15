import Multer from 'multer'
import { Express, Request } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { $app } from '../$app.js'
import { MulterFiles } from '../types/multer.js'

export class FootprintService {
    private fullPath = (value: Express.Multer.File, fileName: string): string => {
        if ((value.mimetype === 'image/jpeg' || value.mimetype === 'image/png' || value.mimetype === 'image/jpg')
            && value.fieldname === 'image') {
            return `images/${fileName}.${value.mimetype.split('/')[1]}`
        }
        if ((value.mimetype === 'audio/mpeg' || value.mimetype === 'audio/mp3' || value.mimetype === 'audio/aac'
            || value.mimetype === 'audio/wav') && value.fieldname === 'audio') {
            return `audios/${fileName}.${value.mimetype.split('/')[1]}`
        }
        if (value.mimetype === 'video/mp4' && value.fieldname === 'video') {
            return `videos/${fileName}.${value.mimetype.split('/')[1]}`
        }
        return ''
    }

    private createPersistentDownloadUrl = (
        bucket: string,
        pathToFile: string,
        downloadToken: string,
        // eslint-disable-next-line max-len
    ) => `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(pathToFile)}?alt=media&token=${downloadToken}`

    uploadFilesToFireStorage = async (files: MulterFiles['files']) => {
        const bucket = $app.storage.bucket('gs://friends-quest.appspot.com/')
        const images: Express.Multer.File[] = files.image
        const audios: Express.Multer.File[] = files.audio
        const concatFiles = [ ...images, ...audios ]
        const promises: Promise<void>[] = []

        const downloadURLs = concatFiles.map((value: Express.Multer.File) => {
            const fileName = uuidv4()
            const bucketFile = bucket.file(this.fullPath(value, fileName))
            const downloadToken = uuidv4()

            promises.push(bucketFile.save(value.buffer, {
                metadata: {
                    contentType: value.mimetype,
                    downloadTokens: downloadToken,
                },
            }))

            return this.createPersistentDownloadUrl(bucket.name, this.fullPath(value, fileName), downloadToken)
        })

        await Promise.all(promises)

        return downloadURLs
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
