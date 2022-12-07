import { Express } from 'express'

export interface MulterFiles extends Express.Request {
    files: {
        image: Express.Multer.File[]
        audio: Express.Multer.File[]
    }
}
