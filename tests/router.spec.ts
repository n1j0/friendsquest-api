import { mock } from 'jest-mock-extended'
import { Application, ErrorRequestHandler, Request, Response } from 'express'
import { Auth } from 'firebase-admin/auth'
import { RequestContext } from '@mikro-orm/core'
import { Router } from '../src/router'
import { ORM } from '../src/orm'
import { Route } from '../src/types/routes'
import responseMock from './helper/responseMock'
import ErrorController from '../src/controller/errorController'
import { NotFoundError } from '../src/errors/NotFoundError'
import { InternalServerError } from '../src/errors/InternalServerError'

jest.mock('swagger-ui-express', () => ({
    serve: 'serve',
    setup: () => 'setup',
}))

jest.mock('express-actuator', () => jest.fn().mockReturnValue('actuator'))

jest.mock('@mikro-orm/core', () => ({
    RequestContext: {
        create: jest.fn(),
    },
}))

jest.mock('../src/router/_firebaseAuth.js', () => ({
    firebaseRoutes: 'firebaseRoutes',
}))

describe.skip('Router', () => {
    let router: Router
    let server: Application
    let orm: ORM

    describe('general setup', () => {
        const response = responseMock
        let sendErrorSpy: jest.SpyInstance

        beforeEach(() => {
            server = mock<Application>()
            orm = mock<ORM>()
            router = new Router(server, orm)
            router.initRoutes(1234, [], jest.fn(), {} as unknown as Auth)
            sendErrorSpy = jest.spyOn(ErrorController, 'sendError')
        })

        it('creates the RequestContext for the orm', () => {
            const next = jest.fn()
            router.createRequestContext({} as unknown as Request, {} as unknown as Response, next)
            expect(RequestContext.create).toHaveBeenCalledWith(orm.orm.em, next)
        })

        it('creates custom 404 response', () => {
            router.custom404({} as unknown as Request, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, NotFoundError.getErrorDocument())
        })

        it('creates custom 500 response', () => {
            const consoleSpy = jest.spyOn(console, 'error')
            const error = new Error('test')
            router.custom500(error as unknown as ErrorRequestHandler, {} as unknown as Request, response)
            expect(consoleSpy).toHaveBeenCalledWith(error)
            expect(sendErrorSpy).toHaveBeenCalledWith(
                response,
                InternalServerError.getErrorDocument('Internal Server Error'),
            )
        })

        it('generates "docs" route', () => {
            expect(server.use).toHaveBeenNthCalledWith(1, '/docs', 'serve', 'setup')
        })

        it('sets orm request context', () => {
            expect(server.use).toHaveBeenNthCalledWith(2, router.createRequestContext)
        })

        it('calls "actuator"', () => {
            expect(server.use).toHaveBeenNthCalledWith(3, 'actuator')
        })

        it('generates "firebase" route', () => {
            expect(server.use).toHaveBeenNthCalledWith(4, '/firebase', 'firebaseRoutes')
        })

        it.todo('sets sentry middleware')

        it('sets custom 404 page', () => {
            expect(server.use).toHaveBeenNthCalledWith(7, router.custom404)
        })

        it('sets custom 500 page', () => {
            expect(server.use).toHaveBeenNthCalledWith(8, router.custom500)
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
