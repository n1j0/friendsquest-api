import { mockDeep } from 'jest-mock-extended'
import { Application, NextFunction, Request, Response } from 'express'
import { EntityManager } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest'
import { startApplication } from '../../../src/helper/startApplication'
import { ORM } from '../../../src/orm'
import { AttributeIsMissingError } from '../../../src/errors/AttributeIsMissingError'

jest.mock('node-fetch', () => jest.fn().mockResolvedValue('node-fetch'))

jest.mock('firebase-admin/app', () => ({
    cert: jest.fn(),
    initializeApp: jest.fn(),
}))

jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn().mockReturnValue('getAuth'),
}))

jest.mock('firebase-admin/storage', () => ({
    getStorage: jest.fn().mockImplementation(() => ({
        appInternal: '',
        storageClient: '',
        bucket: jest.fn().mockReturnValue({
            file: jest.fn().mockReturnValue({
                save: jest.fn(),
            }),
            deleteFiles: jest.fn().mockResolvedValue('deleteFiles'),
        }),
    })),
}))

jest.mock('@sentry/node', () => ({
    Handlers: {
        requestHandler: jest.fn()
            // eslint-disable-next-line unicorn/consistent-function-scoping
            .mockImplementation(() => (_request: Request, _response: Response, next: NextFunction) => next()),
        tracingHandler: jest.fn()
            // eslint-disable-next-line unicorn/consistent-function-scoping
            .mockImplementation(() => (_request: Request, _response: Response, next: NextFunction) => next()),
        errorHandler: jest.fn()
            // eslint-disable-next-line unicorn/consistent-function-scoping
            .mockImplementation(() => (_request: Request, _response: Response, next: NextFunction) => next()),
    },
    Integrations: {
        Http: jest.fn().mockReturnValue('Http'),
    },
    init: jest.fn(),
}))

jest.mock('@sentry/tracing', () => ({
    Integrations: {
        Express: jest.fn().mockReturnValue('Express'),
    },
}))

jest.mock('../../../src/orm.js', () => ({
    ORM: {
        init: jest.fn().mockImplementation(() => {
            const ormMock = mockDeep<ORM>()
            const emMock = mockDeep<EntityManager<PostgreSqlDriver>>()
            // @ts-ignore
            ormMock.orm.getMigrator.mockImplementation(() => ({
                getPendingMigrations: jest.fn().mockResolvedValue([]),
                up: jest.fn().mockReturnValue(Promise.resolve()),
            }))
            // @ts-ignore
            ormMock.forkEm = jest.fn().mockReturnValue(emMock)
            return ormMock
        }),
    },
}))

jest.mock('../../../src/middlewares/firebaseAuth.js', () => ({
    firebaseAuthMiddleware: jest.fn()
        // eslint-disable-next-line unicorn/consistent-function-scoping
        .mockImplementation(() => (_request: Request, _response: Response, next: NextFunction) => next()),
}))

jest.mock('../../../src/repositories/footprint/footprintPostgresRepository.js', () => ({
    FootprintPostgresRepository: jest.fn().mockImplementation(() => ({
        createFootprint: jest.fn().mockResolvedValue({
            footprint: {
                title: 'test',
                latitude: 1,
                longitude: 1,
                description: 'test',
                photoURL: 'photoURL',
                audioURL: 'audioURL',
                temperature: 1,
            },
            points: 100,
            userPoints: 150,
        }),
    })),
}))

describe('CreateFootprint', () => {
    let server: Application | undefined

    beforeAll(async () => {
        server = await startApplication()
    })

    it('should create a footprint', async () => {
        const footprint = {
            title: 'test',
            latitude: 1,
            longitude: 1,
            description: 'test',
        }

        const response = await request(server)
            .post('/footprints')
            .field('title', footprint.title)
            .field('latitude', footprint.latitude)
            .field('longitude', footprint.longitude)
            .field('description', footprint.description)
            .attach('image', 'tests/integration/fixtures/1kb.png')
            .attach('audio', 'tests/integration/fixtures/sample-3s.mp3')
        expect(response.body).toStrictEqual({
            data: {
                audioURL: 'audioURL',
                photoURL: 'photoURL',
                description: footprint.description,
                latitude: footprint.latitude,
                longitude: footprint.longitude,
                temperature: 1,
                title: footprint.title,
            },
            points: {
                amount: 100,
                total: 150,
            },
        })
        expect(response.status).toBe(201)
    })

    it('should return 400 if title is missing', async () => {
        const footprint = {
            latitude: 1,
            longitude: 1,
            description: 'test',
        }
        const response = await request(server)
            .post('/footprints')
            .field('latitude', footprint.latitude)
            .field('longitude', footprint.longitude)
            .field('description', footprint.description)
            .attach('image', 'tests/integration/fixtures/1kb.png')
            .attach('audio', 'tests/integration/fixtures/sample-3s.mp3')
        expect(response.body).toStrictEqual(AttributeIsMissingError.getErrorDocument('Title is required'))
        expect(response.status).toBe(400)
    })
})
