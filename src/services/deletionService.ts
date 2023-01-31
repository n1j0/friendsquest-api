import { getStorage, Storage } from 'firebase-admin/storage'

export class DeletionService {
    readonly storage: Storage

    constructor(storage: Storage = getStorage()) {
        this.storage = storage
    }

    refFromUrl = (url: string): string => {
        const BASEURL = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/`

        let imagePath: string = url.replace(BASEURL, '')

        imagePath = imagePath.slice(0, Math.max(0, imagePath.indexOf('?')))
        imagePath = imagePath.replace(/%2F/g, '/')
        return imagePath.replace(/%20/g, ' ')
    }

    deleteFilesOfOneFootprint = async (audioUrl: string, imageUrl: string) => {
        const bucket = this.storage.bucket()
        return Promise.all([
            bucket.deleteFiles({ prefix: this.refFromUrl(audioUrl) }),
            bucket.deleteFiles({ prefix: this.refFromUrl(imageUrl) }),
        ])
    }

    deleteAllUserFiles = async (uid: string) => {
        const bucket = this.storage.bucket()
        return Promise.all([
            bucket.deleteFiles({ prefix: `audios/${uid}/` }),
            bucket.deleteFiles({ prefix: `images/${uid}/` }),
        ])
    }
}
