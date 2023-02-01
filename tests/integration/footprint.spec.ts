import { mockDeep } from 'jest-mock-extended'
import { Server } from 'node:http'
import { EntityManager } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import request from 'supertest'
import { startApplication } from '../../src/helper/startApplication'
import { ORM } from '../../src/orm'

jest.mock('node-fetch', () => 'node-fetch')

jest.mock('../../src/orm.js', () => ({
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

jest.mock('firebase-admin/app', () => ({
    cert: jest.fn(),
    initializeApp: jest.fn(),
}))

jest.mock('@sentry/node', () => ({
    Handlers: {
        requestHandler: jest.fn().mockReturnValue(() => jest.fn()),
        tracingHandler: jest.fn().mockReturnValue(() => jest.fn()),
        errorHandler: jest.fn().mockReturnValue(() => jest.fn()),
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

jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn().mockReturnValue('getAuth'),
}))

jest.mock('firebase-admin/storage', () => ({
    getStorage: jest.fn().mockReturnValue('getStorage'),
}))

describe('footprintIntegration', () => {
    let server: Server | undefined

    beforeEach(async () => {
        server = await startApplication()
    })

    afterEach(() => {
        server?.close()
    })

    it('server has to be defined', () => {
        expect(server).toBeDefined()
    })

    it('should return 200 with footprints', async () => {
        const result = await request(server).get('/footprints')

        expect(result.status).toBe(200)
    })
})
