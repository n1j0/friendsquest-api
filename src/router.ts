import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { RequestContext } from '@mikro-orm/core'
import { getAuth } from 'firebase-admin/auth'
import actuator from 'express-actuator'
import { openapiSpecification } from './docs/swagger.js'
import { UserRouter } from './routes/user.js'
import { FootprintRouter } from './routes/footprint.js'
import { FriendshipRouter } from './routes/friendship.js'
import { firebaseRoutes } from './routes/_firebaseAuth.js'
import { firebaseAuthMiddleware } from './middlewares/firebaseAuth.js'
import { ORM } from './orm.js'

export default class Router {
    private server: express.Application

    private readonly orm: ORM

    constructor(server: express.Application, orm: ORM) {
        this.server = server
        this.orm = orm
    }

    initRoutes = (port: number) => {
        // TODO: remove this when ready for production
        this.server.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
        console.log(`📖 Docs generated: http://localhost:${port}/docs`)

        this.server.use((_request: express.Request, _response: express.Response, next: express.NextFunction) => {
            RequestContext.create(this.orm.orm.em, next)
        })

        this.server.use(actuator())

        const router = express.Router()

        this.server.use(
            '/users',
            firebaseAuthMiddleware(getAuth()),
            new UserRouter(router, this.orm).createAndReturnRoutes(),
        )
        this.server.use(
            '/footprints',
            firebaseAuthMiddleware(getAuth()),
            new FootprintRouter(router, this.orm).createAndReturnRoutes(),
        )
        this.server.use(
            '/friendships',
            firebaseAuthMiddleware(getAuth()),
            new FriendshipRouter(router, this.orm).createAndReturnRoutes(),
        )
        // TODO: remove this when ready for production
        this.server.use('/firebase', firebaseRoutes)

        // custom 404
        this.server.use((_request: express.Request, response: express.Response) => {
            response.status(404).send("Sorry can't find that!")
        })
        // custom 500
        this.server.use((error: express.ErrorRequestHandler, _request: express.Request, response: express.Response) => {
            console.error(error)
            response.status(500).send('Something broke!')
        })
    }
}
