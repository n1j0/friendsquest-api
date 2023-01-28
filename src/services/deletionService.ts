import { getStorage, Storage } from 'firebase-admin/storage'
import { Auth, getAuth } from 'firebase-admin/auth'

export class DeletionService {
    readonly storage: Storage

    readonly auth: Auth

    constructor(storage: Storage = getStorage(), auth: Auth = getAuth()) {
        this.storage = storage
        this.auth = auth
    }

    refFromUrl = (url: string): string => {
        const BASEURL = `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/`

        let imagePath: string = url.replace(BASEURL, '')

        imagePath = imagePath.slice(0, Math.max(0, imagePath.indexOf('?')))
        imagePath = imagePath.replace(/%2F/g, '/')
        return imagePath.replace(/%20/g, ' ')
    }

    deleteUser = async (uid: string) => this.auth.deleteUser(uid)

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
