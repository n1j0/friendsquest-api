import Multer from 'multer'
import { Express, Request } from 'express'

const upload = Multer({ fileFilter(request: Request, file: Express.Multer.File, callback: Multer.FileFilterCallback) {
    if (file.mimetype === 'image/jpeg'
            || file.mimetype === 'image/png'
            || file.mimetype === 'image/jpg'
            || file.mimetype === 'audio/mpeg'
            || file.mimetype === 'audio/mp3'
            || file.mimetype === 'video/mp4') {
        // eslint-disable-next-line unicorn/no-null
        callback(null, true)
    } else {
        callback(new Error('Type of file is not supported'))
    }
} })

export default upload
