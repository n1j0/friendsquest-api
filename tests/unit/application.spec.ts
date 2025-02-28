import { mock, mockDeep } from 'jest-mock-extended'
import { Application as ExpressApplication, urlencoded } from 'express'
import * as Sentry from '@sentry/node'
import { ORM } from '../../src/orm'
import Application from '../../src/application'
import { Router } from '../../src/router'

jest.mock('firebase-admin/app', () => ({
    initializeApp: jest.fn(),
    cert: jest.fn().mockReturnValue('cert'),
}))

jest.mock('express', () => ({
    json: jest.fn().mockReturnValue('json'),
    urlencoded: jest.fn(),
}))

jest.mock('helmet', () => jest.fn().mockReturnValue('helmet'))

jest.mock('cors', () => jest.fn().mockReturnValue('cors'))

jest.mock('compression', () => jest.fn().mockReturnValue('compression'))

jest.mock('express-actuator', () => jest.fn().mockReturnValue('actuator'))

jest.mock('../../src/router.js', () => ({
    Router: jest.fn().mockImplementation(() => ({
        initRoutes: jest.fn(),
    })),
}))

jest.mock('../../src/router/routes', () => ({
    routes: [],
}))

jest.mock('@sentry/node', () => ({
    Handlers: {
        requestHandler: jest.fn().mockReturnValue('requestHandler'),
        tracingHandler: jest.fn().mockReturnValue('tracingHandler'),
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

describe('Application', () => {
    const ormMock = mockDeep<ORM>()
    const serverMock = mock<ExpressApplication>()
    let app: Application

    describe('constructor', () => {
        beforeEach(() => {
            app = new Application(ormMock, serverMock)
        })

        it('creates a new router instance', () => {
            expect(Router).toHaveBeenCalledWith(serverMock, ormMock)
        })
    })

    describe('connect', () => {
        it.each([
            [ [ 'foo', 'bar' ], 1 ],
            [ [], 0 ],
        ])('migrates pending migrations', async (migrations: string[], expectedUpCalls: number) => {
            const getPendingMigrations = jest.fn().mockResolvedValue(migrations)
            const migrateUp = jest.fn().mockReturnValue(Promise.resolve())
            // @ts-ignore
            ormMock.orm.getMigrator.mockImplementation(() => ({
                getPendingMigrations,
                up: migrateUp,
            }))
            app = new Application(ormMock, serverMock)
            await app.migrate()
            const migrator = ormMock.orm.getMigrator
            expect(migrator).toHaveBeenCalled()
            expect(getPendingMigrations).toHaveBeenCalled()
            expect(migrateUp).toHaveBeenCalledTimes(expectedUpCalls)
        })

        it('prints an error if something goes wrong', async () => {
            const error = new Error('test')
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
            // @ts-ignore
            ormMock.orm.getMigrator.mockImplementation(() => { throw error })
            app = new Application(ormMock, serverMock)
            await app.migrate()
            expect(consoleSpy).toHaveBeenCalledWith('Error occurred: test')
        })
    })

    describe('init', () => {
        beforeEach(async () => {
            app = new Application(ormMock, serverMock)
            app.migrate = jest.fn()
            await app.init()
        })

        it('calls migrations', () => {
            expect(app.migrate).toHaveBeenCalled()
        })

        it('sets up global middlewares', () => {
            expect(serverMock.use).toHaveBeenNthCalledWith(3, 'json')
            expect(serverMock.use).toHaveBeenNthCalledWith(4, urlencoded())
            expect(urlencoded).toHaveBeenCalledWith({ extended: true })
            expect(serverMock.use).toHaveBeenNthCalledWith(5, 'helmet')
            expect(serverMock.use).toHaveBeenNthCalledWith(6, 'cors')
            expect(serverMock.use).toHaveBeenNthCalledWith(7, 'compression')
            expect(serverMock.use).toHaveBeenNthCalledWith(8, 'actuator')
        })

        it('disables "x-powered-by" header', () => {
            expect(serverMock.disable).toHaveBeenCalledWith('x-powered-by')
        })

        it('initializes the routes', () => {
            expect(app.router.initRoutes).toHaveBeenCalledWith([])
        })
    })

    describe('initSentry', () => {
        app = new Application(ormMock, serverMock)

        it('initializes sentry', () => {
            app.initSentry()
            jest.spyOn(Sentry, 'init').mockImplementation(() => {})
            expect(Sentry.init).toHaveBeenCalledWith(expect.objectContaining({
                dsn: 'sentry_dsn',
                integrations: expect.any(Array),
                tracesSampleRate: 1,
                release: expect.any(String),
            }))
        })
    })

    describe('migrate', () => {
        it('throws error if something goes wrong', async () => {
            ormMock.orm.getMigrator.mockImplementation(() => { throw new Error('test') })
            jest.spyOn(console, 'error').mockImplementation(() => {})
            app = new Application(ormMock, serverMock)
            await app.migrate()
            expect(console.error).toHaveBeenCalledWith('Error occurred: test')
        })

        it.each([
            [ [], 0 ],
            [ ['foo'], 1 ],
            [ [ 'foo', 'bar' ], 1 ],
        ])('migrates pending migrations %s in %i step(s)', async (migrations: string[], upCalls: number) => {
            const getPendingMigrations = jest.fn().mockResolvedValue(migrations)
            const migrateUp = jest.fn().mockReturnValue(Promise.resolve())
            // @ts-ignore
            ormMock.orm.getMigrator.mockImplementation(() => ({
                getPendingMigrations,
                up: migrateUp,
            }))
            app = new Application(ormMock, serverMock)
            await app.migrate()
            expect(getPendingMigrations).toHaveBeenCalled()
            expect(migrateUp).toHaveBeenCalledTimes(upCalls)
        })
    })
})
