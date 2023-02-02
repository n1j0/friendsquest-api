import { Storage } from 'firebase-admin/lib/storage'
import { DeletionService } from '../../../src/services/deletionService'
import { storage } from '../../test-helper/storage'

jest.mock('firebase-admin/storage', () => ({
    getStorage: jest.fn().mockReturnValue('getStorage'),
}))

jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn().mockReturnValue('getAuth'),
}))

describe('DeletionService', () => {
    let deletionService: DeletionService

    beforeEach(() => {
        deletionService = new DeletionService(storage as unknown as Storage)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('initializes default storage and auth', () => {
        const deletionServiceWithDefaultStorage = new DeletionService()
        expect(deletionServiceWithDefaultStorage.storage).toBe('getStorage')
    })

    it('returns the firebase storage ref from an url', () => {
        // eslint-disable-next-line max-len
        const url = 'https://firebasestorage.googleapis.com/v0/b/storage_bucket/o/audio%20files%2FuserId%2Ftest.mp3?alt=media&token=token'
        expect(deletionService.refFromUrl(url)).toBe('audio files/userId/test.mp3')
    })

    it('deletes all files of one footprint', async () => {
        const promiseSpy = jest.spyOn(Promise, 'all')
        // eslint-disable-next-line max-len
        const audioUrl = 'https://firebasestorage.googleapis.com/v0/b/storage_bucket/o/audios%2FuserId%2Ftest.mp3?alt=media&token=token'
        // eslint-disable-next-line max-len
        const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/storage_bucket/o/images%2FuserId%2Ftest.jpg?alt=media&token=token'
        await deletionService.deleteFilesOfOneFootprint(audioUrl, imageUrl)
        expect(promiseSpy).toHaveBeenCalledWith([ expect.any(Promise), expect.any(Promise) ])
        expect(storage.bucket().deleteFiles).toHaveBeenCalledTimes(2)
        expect(storage.bucket().deleteFiles).toHaveBeenCalledWith({ prefix: 'audios/userId/test.mp3' })
        expect(storage.bucket().deleteFiles).toHaveBeenCalledWith({ prefix: 'images/userId/test.jpg' })
    })

    it('deletes all user files', async () => {
        const promiseSpy = jest.spyOn(Promise, 'all')
        const userId = 'userId'
        await deletionService.deleteAllUserFiles(userId)
        expect(promiseSpy).toHaveBeenCalledWith([ expect.any(Promise), expect.any(Promise) ])
        expect(storage.bucket().deleteFiles).toHaveBeenCalledTimes(2)
        expect(storage.bucket().deleteFiles).toHaveBeenCalledWith({ prefix: `audios/${userId}/` })
        expect(storage.bucket().deleteFiles).toHaveBeenCalledWith({ prefix: `images/${userId}/` })
    })
})
