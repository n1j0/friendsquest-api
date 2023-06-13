import { mockDeep } from 'jest-mock-extended'
import { Application, NextFunction, Request, Response } from 'express'
import { EntityManager } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest'
import { startApplication } from '../../../src/helper/startApplication'
import { ORM } from '../../../src/orm'

jest.mock('node-fetch', () => 'node-fetch')

jest.mock('firebase-admin/app', () => ({
    cert: jest.fn(),
    initializeApp: jest.fn(),
}))

jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn().mockReturnValue('getAuth'),
}))

jest.mock('firebase-admin/storage', () => ({
    getStorage: jest.fn().mockReturnValue('getStorage'),
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
            emMock.getRepository.mockImplementation(() => ({
                findAll: jest.fn().mockResolvedValue([ 'footprint1', 'footprint2' ]),
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

describe('just for demonstration right now', () => {
    let server: Application | undefined

    beforeAll(async () => {
        server = await startApplication()
    })

    it('server has to be defined', () => {
        expect(server).toBeDefined()
    })

    // eslint will complain about the following test (warning),
    // but it's just for demonstration of the two possible ways to test
    // but second approach should be preferred, I guess.
    it('should return up for health-plain route', async () => {
        await request(server)
            .get('/health-plain')
            .expect(200)
            .expect('UP')
    })

    it('should return all footprints', async () => {
        const response = await request(server)
            .get('/footprints/all')
        expect(response.body).toStrictEqual({
            data: [ 'footprint1', 'footprint2' ],
            points: {},
        })
        expect(response.status).toBe(200)
    })
})
