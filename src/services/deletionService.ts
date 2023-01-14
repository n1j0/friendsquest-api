import { getStorage, Storage } from 'firebase-admin/storage'
import { getAuth } from 'firebase-admin/auth'

export class DeletionService {
    readonly storage: Storage

    constructor(storage: Storage = getStorage()) {
        this.storage = storage
    }

    deleteUser = async (uid: string) => getAuth().deleteUser(uid)

    deleteFiles = async (uid: string) => {
        const bucket = this.storage.bucket()
        return Promise.all([
            bucket.deleteFiles({ prefix: `audios/${uid}/` }),
            bucket.deleteFiles({ prefix: `images/${uid}/` }),
        ])
    }
}
