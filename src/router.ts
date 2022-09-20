import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { EntityManager, MikroORM, RequestContext } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { openapiSpecification } from './docs/swagger.js'
import index from './routes/index.js'

export default class Router {
    private app: express.Application

    private readonly em: EntityManager<PostgreSqlDriver>

    constructor(app: express.Application, orm: MikroORM<PostgreSqlDriver>) {
        this.app = app
        this.em = orm.em
    }

    public initRoutes = () => {
        if (process.env.NODE_ENV !== 'production') {
            this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
        }

        this.app.use((_request: express.Request, _response: express.Response, next: express.NextFunction) => {
            RequestContext.create(this.em, next)
        })

        this.app.use('/', index)
    }
}
