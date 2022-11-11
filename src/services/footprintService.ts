import Multer from 'multer'
import { Express, Request } from 'express'

const upload = Multer({
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

export const fullPath = (value: Express.Multer.File, fileName: string): string => {
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

export default upload
