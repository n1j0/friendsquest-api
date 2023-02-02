import { mockDeep } from 'jest-mock-extended'
import { Application, NextFunction, Request, Response } from 'express'
import { EntityManager } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest'
import { startApplication } from '../../../src/helper/startApplication'
import { ORM } from '../../../src/orm'

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
        acceptFriendship: jest.fn().mockResolvedValue({ invitor: 'invitor', invitee: 'invitee', points: 10 }),
        getFriendshipById: jest.fn().mockResolvedValue({
            invitee: {
                uid: 'abc',
            },
            invitor: {
                uid: 'uid',
            },
            status: 'not_accepted',
        }),
    })),
}))

describe('AcceptFriendship', () => {
    let server: Application | undefined

    beforeAll(async () => {
        server = await startApplication()
    })

    it('should return 200', async () => {
        const response = await request(server)
            .patch('/friendships/1')
            .set({ authenticatedUser: 'abc' })

        console.log(response)
        expect(response.headers.authenticatedUser).toEqual('abc')
        expect(response.body).toEqual({
            data: {
                id: 1,
                invitor: 'invitor',
                invitee: 'invitee',
                status: 'accepted',
            },
            points: {
                amount: '',
                total: '',
            },
        })
        expect(response.status).toBe(200)
    })

    it('should return error', async () => {})
})