import { Application, ErrorRequestHandler, NextFunction, Request, Response, Router as ExpressRouter } from 'express'
import swaggerUi from 'swagger-ui-express'
import { RequestContext } from '@mikro-orm/core'
import { getAuth } from 'firebase-admin/auth'
import actuator from 'express-actuator'
import { openapiSpecification } from './docs/swagger.js'
import { firebaseRoutes } from './routes/_firebaseAuth.js'
import { firebaseAuthMiddleware } from './middlewares/firebaseAuth.js'
import { ORM } from './orm.js'
import { Route } from './types/routes'
import ErrorController from './controller/errorController.js'

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
        ErrorController.sendError(response, 404, "Sorry can't find that!")
    }

    custom500 = (error: ErrorRequestHandler, _request: Request, response: Response) => {
        console.error(error)
        ErrorController.sendError(response, 500, 'Something broke!')
    }

    initRoutes = (
        port: number,
        routes: Route[],
        authMiddleware = firebaseAuthMiddleware,
        auth = getAuth(),
    ) => {
        // TODO: remove this when ready for production
        this.server.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
        console.log(`📖 Docs generated: http://localhost:${port}/docs`)

        this.server.use(this.createRequestContext)

        this.server.use(actuator())

        const router = ExpressRouter()

        routes.forEach((route) => {
            this.server.use(
                route.path,
                authMiddleware(auth),
                // eslint-disable-next-line new-cap
                new route.routerClass(router, this.orm).createAndReturnRoutes(),
            )
        })

        // TODO: remove this when ready for production
        this.server.use('/firebase', firebaseRoutes)

        // custom 404
        this.server.use(this.custom404)
        // custom 500
        this.server.use(this.custom500)
    }
}
