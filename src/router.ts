import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { EntityManager, MikroORM, RequestContext } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { openapiSpecification } from './docs/swagger.js'
import { indexRoutes } from './routes/index.js'
import { usersRoutes } from './routes/user.js'
import { footprintRoutes } from './routes/footprint.js'
import { $app } from './application.js'
import { firebaseRoutes } from './routes/_firebaseAuth.js'

export default class Router {
    private server: express.Application

    private readonly em: EntityManager<PostgreSqlDriver>

    constructor(server: express.Application, orm: MikroORM<PostgreSqlDriver>) {
        this.server = server
        this.em = orm.em
    }

    public initRoutes = () => {
        // remove this when ready for production
        this.server.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
        console.log(`📖 Docs generated: http://localhost:${$app.port}/docs`)

        this.server.use((_request: express.Request, _response: express.Response, next: express.NextFunction) => {
            RequestContext.create(this.em, next)
        })

        this.server.use('/', indexRoutes)
        this.server.use('/users', usersRoutes)
        this.server.use('/footprints', footprintRoutes)
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
