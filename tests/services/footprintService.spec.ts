import { Express } from 'express'
import { Readable } from 'node:stream'
import { Storage } from 'firebase-admin/storage'
import { FootprintService } from '../../src/services/footprintService'

const storage: { bucket: jest.Mock, storageClient: string, appInternal: string } = {
    appInternal: '',
    storageClient: '',
    bucket: jest.fn().mockReturnValue({
        file: jest.fn().mockReturnValue({
            save: jest.fn(),
        }),
    }),
}

const generateFile = (fieldname: string, mimetype: string): Express.Multer.File => ({
    fieldname,
    originalname: '',
    encoding: '',
    mimetype,
    size: 1,
    stream: new Readable(),
    destination: '',
    filename: '',
    path: '',
    buffer: Buffer.from(''),
})

describe('FootprintService', () => {
    let footprintService: FootprintService

    beforeEach(() => {
        footprintService = new FootprintService(storage as unknown as Storage)
    })

    it('creates persistent download Url', () => {
        const bucket = 'bucketString'
        const filePath = 'path?Ä&'
        const filePathEncoded = 'path%3F%C3%84%26'
        const downloadToken = 'token'
        const url = footprintService.createPersistentDownloadUrl(bucket, filePath, downloadToken)
        // eslint-disable-next-line max-len
        expect(url).toBe(`https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${filePathEncoded}?alt=media&token=${downloadToken}`)
    })

    it.each([
        [ 'image', 'image/jpeg', 'fooImage', 'images/fooImage.jpeg' ],
        [ 'image', 'image/png', 'barImage', 'images/barImage.png' ],
        [ 'image', 'image/jpg', 'sampleImage', 'images/sampleImage.jpg' ],
        [ 'audio', 'audio/mpeg', 'fooAudio', 'audios/fooAudio.mpeg' ],
        [ 'audio', 'audio/mp3', 'barAudio', 'audios/barAudio.mp3' ],
        [ 'audio', 'audio/aac', 'sampleAudio', 'audios/sampleAudio.aac' ],
        [ 'video', 'video/mp4', 'fooVideo', 'videos/fooVideo.mp4' ],
        [ 'video', 'image/jpeg', 'invalidMimeType', '' ],
        [ 'audio', 'application/json', 'invalidMimeType', '' ],
    ])(
        'generates full path for %s with mimetype %s and name %s',
        (fieldname: string, mimetype: string, filename: string, path: string) => {
            const file: Express.Multer.File = generateFile(fieldname, mimetype)
            expect(footprintService.fullPath(file, filename)).toBe(path)
        },
    )

    it('returns empty array if no files are given for upload', async () => {
        const result = await footprintService.uploadFilesToFireStorage({ audio: [], image: [] })
        expect(result).toStrictEqual([])
    })

    it('uploads files to firebase storage and returns urls', async () => {
        const fullPath = jest.fn()
        footprintService.fullPath = fullPath

        const audio: Express.Multer.File = generateFile('audio', 'audio/mp3')
        const image: Express.Multer.File = generateFile('image', 'image/jpg')
        const result = await footprintService.uploadFilesToFireStorage({ audio: [audio], image: [image] })

        expect(storage.bucket).toHaveBeenCalledWith('gs://friends-quest.appspot.com/')
        expect(fullPath).toHaveBeenCalledTimes(2)
        expect(result).toHaveProperty('length', 2)
    })

    it('sets up upload middleware', () => {
        expect(footprintService.uploadMiddleware).toHaveProperty('fileFilter', expect.any(Function))
    })
})
