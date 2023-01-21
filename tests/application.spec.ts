import { mock, mockDeep } from 'jest-mock-extended'
import { Application as ExpressApplication, urlencoded } from 'express'
import { initializeApp } from 'firebase-admin/app'
import { ORM } from '../src/orm'
import Application from '../src/application'
import { Router } from '../src/router'

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

jest.mock('../src/router.js', () => ({
    Router: jest.fn().mockImplementation(() => ({
        initRoutes: jest.fn(),
    })),
}))

jest.mock('../src/router/routes', () => ({
    routes: [],
}))

describe('Application', () => {
    const ormMock = mockDeep<ORM>()
    const serverMock = mock<ExpressApplication>()
    let app: Application

    describe('constructor', () => {
        beforeEach(() => {
            app = new Application(ormMock, serverMock)
        })

        it('initializes the firebase admin app', () => {
            expect(initializeApp).toHaveBeenCalledWith({
                credential: 'cert',
                storageBucket: 'gs://storage_bucket/',
            })
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
            const consoleSpy = jest.spyOn(console, 'error')
            // @ts-ignore
            ormMock.orm.getMigrator.mockImplementation(() => { throw error })
            app = new Application(ormMock, serverMock)
            await app.migrate()
            expect(consoleSpy).toHaveBeenCalledWith('Error occurred: test')
        })
    })

    describe('init', () => {
        beforeEach(() => {
            app = new Application(ormMock, serverMock)
            app.init()
        })

        it.skip('sets up global middlewares', () => {
            expect(serverMock.use).toHaveBeenNthCalledWith(1, 'json')
            expect(serverMock.use).toHaveBeenNthCalledWith(2, urlencoded())
            expect(urlencoded).toHaveBeenCalledWith({ extended: true })
            expect(serverMock.use).toHaveBeenNthCalledWith(3, 'helmet')
            expect(serverMock.use).toHaveBeenNthCalledWith(4, 'cors')
            expect(serverMock.use).toHaveBeenNthCalledWith(5, 'compression')
        })

        it('disables "x-powered-by" header', () => {
            expect(serverMock.disable).toHaveBeenCalledWith('x-powered-by')
        })

        it('initializes the routes', () => {
            expect(app.router.initRoutes).toHaveBeenCalledWith([])
        })

        it('starts the server', () => {
            expect(serverMock.listen).toHaveBeenCalledWith(1234)
        })

        it('throws an error if server cannot be started', () => {
            const consoleSpy = jest.spyOn(console, 'error')
            const error = new Error('test')
            serverMock.listen.mockImplementation(() => { throw error })
            app.init()
            expect(consoleSpy).toHaveBeenCalledWith('Could not start server', error)
        })
    })
})
