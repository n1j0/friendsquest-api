import { Express } from 'express'
import { Readable } from 'node:stream'
import { Storage } from 'firebase-admin/storage'
import { FootprintService } from '../../../src/services/footprintService'
import { storage } from '../../test-helper/storage'

jest.mock('node-fetch', () => jest.fn().mockImplementation(() => ({
    ok: true,
    json: jest.fn().mockImplementation(() => 'temp'),
})))

jest.mock('firebase-admin/storage', () => ({
    getStorage: jest.fn().mockReturnValue('getStorage'),
}))

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

    it('initializes default storage', () => {
        const footprintServiceWithDefaultStorage = new FootprintService()
        expect(footprintServiceWithDefaultStorage.storage).toBe('getStorage')
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
        [ 'image', 'image/jpeg', 'fooImage', 'hsjf', 'images/hsjf/fooImage.jpeg' ],
        [ 'image', 'image/png', 'barImage', '67dh', 'images/67dh/barImage.png' ],
        [ 'image', 'image/jpg', 'sampleImage', 'dfg45', 'images/dfg45/sampleImage.jpg' ],
        [ 'audio', 'audio/mpeg', 'fooAudio', 'sfdgk', 'audios/sfdgk/fooAudio.mpeg' ],
        [ 'audio', 'audio/mp3', 'barAudio', '45z', 'audios/45z/barAudio.mp3' ],
        [ 'audio', 'audio/aac', 'sampleAudio', 'sadfgh45', 'audios/sadfgh45/sampleAudio.aac' ],
        [ 'video', 'video/mp4', 'fooVideo', 'fdsag', 'videos/fdsag/fooVideo.mp4' ],
        [ 'video', 'image/jpeg', '34qt', 'invalidMimeType', '' ],
        [ 'audio', 'application/json', 'f8i', 'invalidMimeType', '' ],
    ])(
        'generates full path for %s with mimetype %s and name %s',
        (fieldname: string, mimetype: string, filename: string, uid: string, path: string) => {
            const file: Express.Multer.File = generateFile(fieldname, mimetype)
            expect(footprintService.fullPath(file, filename, uid)).toBe(path)
        },
    )

    it('returns empty array if no files are given for upload', async () => {
        const result = await footprintService.uploadFilesToFireStorage({ audio: [], image: [] }, '')
        expect(result).toStrictEqual([])
    })

    it('uploads files to firebase storage and returns urls', async () => {
        const fullPath = jest.fn()
        footprintService.fullPath = fullPath

        const audio: Express.Multer.File = generateFile('audio', 'audio/mp3')
        const image: Express.Multer.File = generateFile('image', 'image/jpg')
        const result = await footprintService.uploadFilesToFireStorage({ audio: [audio], image: [image] }, '')

        expect(storage.bucket).toHaveBeenCalled()
        expect(fullPath).toHaveBeenCalledTimes(2)
        expect(result).toHaveProperty('length', 2)
    })

    describe('uploadMiddleware', () => {
        const footprintService2 = new FootprintService(storage as unknown as Storage)
        const middleware = footprintService2.uploadMiddleware as any
        const callback = jest.fn()

        it.each([
            ['image/jpeg'],
            ['image/png'],
            ['image/jpg'],
            ['audio/wav'],
            ['audio/mpeg'],
            ['audio/mp3'],
            ['video/mp4'],
        ])('handles correct mimetype %s', (mimetype: string) => {
            middleware.fileFilter({}, generateFile('foo', mimetype), callback)
            /* eslint-disable-next-line unicorn/no-null */
            expect(callback).toHaveBeenCalledWith(null, true)
        })

        it('rejects invalid mimetype', () => {
            middleware.fileFilter({}, generateFile('foo', 'not/valid'), callback)
            expect(callback).toHaveBeenCalledWith(new Error('Type of file is not supported'))
        })
    })

    describe('getTemperature', () => {
        it('calls api with correct parameters', async () => {
            // eslint-disable-next-line global-require,unicorn/prefer-module
            const fetch = require('node-fetch')
            fetch.mockImplementation(() => ({
                ok: true,
                json: jest.fn().mockImplementation(() => 'temp'),
            }))
            await footprintService.getTemperature('12.34', '23.234')
            // eslint-disable-next-line max-len
            expect(fetch).toHaveBeenCalledWith('https://api.openweathermap.org/data/2.5/weather?lat=12.34&lon=23.234&appid=open_weather_api_key&units=metric')
        })

        it('returns temperature', async () => {
            const result = await footprintService.getTemperature('12.34', '23.234')
            expect(result).toBe('temp')
        })

        it('returns undefined if api call fails', async () => {
            // eslint-disable-next-line global-require,unicorn/prefer-module
            const fetch = require('node-fetch')
            fetch.mockImplementation(() => ({
                ok: false,
                json: jest.fn().mockImplementation(() => 'temp'),
            }))
            const result = await footprintService.getTemperature('12.34', '23.234')
            expect(result).toBeUndefined()
        })
    })
})
