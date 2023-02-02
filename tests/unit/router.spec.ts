import { mock } from 'jest-mock-extended'
import { Application, ErrorRequestHandler, Request, Response } from 'express'
import { Auth } from 'firebase-admin/auth'
import { RequestContext } from '@mikro-orm/core'
import { Router } from '../../src/router'
import { ORM } from '../../src/orm'
import { Route } from '../../src/types/routes'
import responseMock from '../test-helper/responseMock'
import ResponseSender from '../../src/helper/responseSender'
import { NotFoundError } from '../../src/errors/NotFoundError'
import { InternalServerError } from '../../src/errors/InternalServerError'

jest.mock('swagger-ui-express', () => ({
    serve: jest.fn().mockReturnValue('serve'),
    setup: jest.fn().mockImplementation(() => jest.fn()),
}))

jest.mock('express-actuator', () => jest.fn().mockReturnValue('actuator'))

jest.mock('@mikro-orm/core', () => ({
    RequestContext: {
        create: jest.fn(),
    },
}))

jest.mock('@sentry/node', () => ({
    Handlers: {
        errorHandler: jest.fn().mockReturnValue('errorHandler'),
    },
}))

jest.mock('../../src/router/_firebaseAuth.js', () => ({
    firebaseRoutes: 'firebaseRoutes',
}))

jest.mock('../../src/admin/middlewares/basicAuth.js', () => ({
    basicAuth: () => 'basicAuth',
}))

jest.mock('../../src/admin/currentPath.cjs')

jest.mock('../../src/middlewares/firebaseAuth.js', () => ({
    firebaseAuthMiddleware: jest.fn().mockReturnValue('firebaseAuthMiddleware'),
}))

jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn().mockReturnValue('getAuth'),
}))

describe('Router', () => {
    let router: Router
    let server: Application
    let orm: ORM

    describe('general setup', () => {
        const response = responseMock
        let errorSpy: jest.SpyInstance

        beforeEach(() => {
            server = mock<Application>()
            orm = mock<ORM>()
            router = new Router(server, orm)
            router.initRoutes([], jest.fn(), {} as unknown as Auth)
            errorSpy = jest.spyOn(ResponseSender, 'error')
        })

        it('creates the RequestContext for the orm', () => {
            const next = jest.fn()
            router.createRequestContext({} as unknown as Request, {} as unknown as Response, next)
            expect(RequestContext.create).toHaveBeenCalledWith(orm.orm.em, next)
        })

        it('creates custom 404 response', () => {
            router.custom404({} as unknown as Request, response)
            expect(errorSpy).toHaveBeenCalledWith(response, NotFoundError.getErrorDocument())
        })

        it('creates custom 500 response', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
            const error = new Error('test')
            router.custom500(error as unknown as ErrorRequestHandler, {} as unknown as Request, response)
            expect(consoleSpy).toHaveBeenCalledWith(error)
            expect(errorSpy).toHaveBeenCalledWith(
                response,
                InternalServerError.getErrorDocument('Internal Server Error'),
            )
        })

        it('set sentry error handling object', () => {
            const sentryErrorOptions = router.sentryErrorHandlingOptions()
            expect(sentryErrorOptions).toHaveProperty('shouldHandleError')
            expect(sentryErrorOptions.shouldHandleError()).toBe(true)
        })

        it('sets orm request context', () => {
            expect(server.use).toHaveBeenNthCalledWith(1, router.createRequestContext)
        })

        it('calls "actuator"', () => {
            expect(server.use).toHaveBeenNthCalledWith(2, 'actuator')
        })

        it('generates "firebase" route', () => {
            expect(server.use).toHaveBeenNthCalledWith(3, '/firebase', 'basicAuth', 'firebaseRoutes')
        })

        it('sets sentry middleware', () => {
            expect(server.use).toHaveBeenNthCalledWith(5, 'errorHandler')
        })

        it('sets custom 404 page', () => {
            expect(server.use).toHaveBeenNthCalledWith(6, router.custom404)
        })

        it('sets custom 500 page', () => {
            expect(server.use).toHaveBeenNthCalledWith(7, router.custom500)
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
            router.initRoutes(routes, authMiddleware, auth as unknown as Auth)
            expect(authMiddleware).toHaveBeenCalledTimes(2)
            expect(authMiddleware).toHaveBeenCalledWith(auth)
            expect(server.use).toHaveBeenNthCalledWith(3, routes[0].path, 'authMiddleware', 'someRoutes')
        })
    })

    describe('init routes', () => {
        beforeEach(() => {
            server = mock<Application>()
            orm = mock<ORM>()
            router = new Router(server, orm)
        })

        it('uses default values for params', () => {
            expect(router.initRoutes([])).toBeUndefined()
        })
    })
})
