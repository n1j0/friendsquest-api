import { MulterFiles } from './multer'

export interface NewFootprint {
    title: string
    latitude: string
    longitude: string
    files: MulterFiles['files']
    uid: string
}
