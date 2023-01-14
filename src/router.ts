import { Application, ErrorRequestHandler, NextFunction, Request, Response, Router as ExpressRouter } from 'express'
import { RequestContext } from '@mikro-orm/core'
import { getAuth } from 'firebase-admin/auth'
import actuator from 'express-actuator'
import * as Sentry from '@sentry/node'
import { join } from 'node:path'
import { firebaseRoutes } from './router/_firebaseAuth.js'
import { firebaseAuthMiddleware } from './middlewares/firebaseAuth.js'
import { ORM } from './orm.js'
import { Route } from './types/routes'
import ErrorController from './controller/errorController.js'
import { NotFoundError } from './errors/NotFoundError.js'
import { InternalServerError } from './errors/InternalServerError.js'
// @ts-ignore
import { AdminRouter } from './admin/admin.js'
// @ts-ignore
import * as currentPath from './admin/currentPath.cjs'
import { basicAuth } from './admin/middlewares/basicAuth.js'

export class Router {
    private server: Application

    private readonly orm: ORM

    constructor(server: Application, orm: ORM) {
        this.server = server
        this.orm = orm
    }

    createRequestContext = (_request: Request, _response: Response, next: NextFunction) => {
        RequestContext.create(this.orm.orm.em, next)
    }

    custom404 = (_request: Request, response: Response) => {
        ErrorController.sendError(response, NotFoundError.getErrorDocument())
    }

    custom500 = (error: ErrorRequestHandler, _request: Request, response: Response) => {
        console.error(error)
        ErrorController.sendError(response, InternalServerError.getErrorDocument('Internal Server Error'))
    }

    initRoutes = (
        routes: Route[],
        authMiddleware = firebaseAuthMiddleware,
        auth = getAuth(),
    ) => {
        this.server.use(this.createRequestContext)

        this.server.use(actuator())

        routes.forEach((route) => {
            this.server.use(
                route.path,
                authMiddleware(auth),
                // eslint-disable-next-line new-cap
                new route.routerClass(ExpressRouter(), this.orm).createAndReturnRoutes(),
            )
        })

        // TODO: remove this when ready for production
        this.server.use('/firebase', firebaseRoutes)

        this.server.set('view engine', 'ejs')
        this.server.set('views', join(currentPath.default, './views'))
        this.server.use('/admin', basicAuth(), new AdminRouter(ExpressRouter(), this.orm).createAndReturnRoutes())

        this.server.use(Sentry.Handlers.errorHandler({
            shouldHandleError() {
                return true
            },
        }))

        // custom 404
        this.server.use(this.custom404)
        // custom 500
        this.server.use(this.custom500)
    }
}
