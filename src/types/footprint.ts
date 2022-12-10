import { MulterFiles } from './multer'

export interface NewFootprint {
    title: string
    description?: string
    latitude: string
    longitude: string
    files: MulterFiles['files']
    uid: string
}
