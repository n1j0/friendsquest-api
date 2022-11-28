import { mock } from 'jest-mock-extended'
import { Application } from 'express'
import { Auth } from 'firebase-admin/auth'
import { Router } from '../src/router'
import { ORM } from '../src/orm'
import { Route } from '../src/types/routes'

jest.mock('swagger-ui-express', () => ({
    serve: 'serve',
    setup: () => 'setup',
}))

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('express-actuator', () => () => 'actuator')

jest.mock('../src/routes/_firebaseAuth.js', () => ({
    firebaseRoutes: 'firebaseRoutes',
}))

describe('Router', () => {
    let router: Router
    let server: Application
    let orm: ORM

    describe('general setup', () => {
        beforeEach(() => {
            server = mock<Application>()
            orm = mock<ORM>()
            router = new Router(server, orm)
            router.initRoutes(1234, [], jest.fn(), {} as unknown as Auth)
        })

        it('generates "docs" route', () => {
            expect(server.use).toHaveBeenNthCalledWith(1, '/docs', 'serve', 'setup')
        })

        // TODO: how to test inner function?
        it.skip('sets orm request context', () => {
            expect(server.use).toHaveBeenNthCalledWith(2, '')
        })

        it('calls "actuator"', () => {
            expect(server.use).toHaveBeenNthCalledWith(3, 'actuator')
        })

        it('generates "firebase" route', () => {
            expect(server.use).toHaveBeenNthCalledWith(4, '/firebase', 'firebaseRoutes')
        })

        // TODO: how to test inner function?
        it.skip('sets custom 404 page', () => {
            expect(server.use).toHaveBeenNthCalledWith(5, expect.any(Function))
        })

        // TODO: how to test inner function?
        it.skip('sets custom 500 page', () => {
            expect(server.use).toHaveBeenNthCalledWith(6, expect.any(Function))
        })
    })

    describe('dynamic route generation', () => {
        const authMiddleware = jest.fn().mockReturnValue('authMiddleware')
        const auth = jest.fn().mockReturnValue('auth')
        beforeEach(() => {
            server = mock<Application>()
            orm = mock<ORM>()
            router = new Router(server, orm)
        })
        it('dynamically generates routes', () => {
            const routerClass = jest.fn().mockImplementation(() => ({
                createAndReturnRoutes: jest.fn().mockReturnValue('someRoutes'),
            }))
            const routes: Route[] = [
                {
                    path: '/foo',
                    routerClass,
                },
                {
                    path: '/bar',
                    routerClass,
                },
            ]
            router.initRoutes(1234, routes, authMiddleware, auth as unknown as Auth)
            expect(authMiddleware).toHaveBeenCalledTimes(2)
            expect(authMiddleware).toHaveBeenCalledWith(auth)
            expect(server.use).toHaveBeenNthCalledWith(4, routes[0].path, 'authMiddleware', 'someRoutes')
        })
    })
})
