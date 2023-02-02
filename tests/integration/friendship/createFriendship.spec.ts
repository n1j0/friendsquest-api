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

jest.mock('../../../src/repositories/friendship/friendshipPostgresRepository.js', () => ({
    FriendshipPostgresRepository: jest.fn().mockImplementation(() => ({
        createFriendship: jest.fn().mockResolvedValue('createFriendship'),
    })),
}))

describe('CreateFriendship', () => {
    let server: Application | undefined

    beforeAll(async () => {
        server = await startApplication()
    })

    it.skip('should return 201', async () => {
        const response = await request(server)
            .post('/friendships')
            .send({
                friendsCode: 'friendsCode',
            })

        expect(response.body).toEqual('createFriendship')
        expect(response.status).toBe(201)
    })

    it('should return an error if friendsCode is not set', async () => {
        const response = await request(server)
            .post('/friendships')

        expect(response.body).toEqual(AttributeIsMissingError.getErrorDocument('FriendsCode is required'))
        expect(response.status).toBe(400)
    })
})
