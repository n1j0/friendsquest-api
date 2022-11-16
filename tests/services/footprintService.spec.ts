import { Express } from 'express'
import { Readable } from 'node:stream'
import { FootprintService } from '../../src/services/footprintService'

jest.mock('../../src/$app', () => {})

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
        footprintService = new FootprintService()
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
})
