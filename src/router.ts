import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { EntityManager, MikroORM, RequestContext } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { openapiSpecification } from './docs/swagger.js'
import { indexRoutes } from './routes/index.js'
import { booksRoutes } from './routes/books.js'
import { $app } from './application.js'

export default class Router {
    private server: express.Application

    private readonly em: EntityManager<PostgreSqlDriver>

    constructor(server: express.Application, orm: MikroORM<PostgreSqlDriver>) {
        this.server = server
        this.em = orm.em
    }

    public initRoutes = () => {
        if (process.env.NODE_ENV !== 'production') {
            this.server.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
            console.log(`📖 Docs generated: http://localhost:${$app.port}/docs`)
        }

        this.server.use((_request: express.Request, _response: express.Response, next: express.NextFunction) => {
            RequestContext.create(this.em, next)
        })

        this.server.use('/', indexRoutes)
        this.server.use('/books', booksRoutes)
    }
}
