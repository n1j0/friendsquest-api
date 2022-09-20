import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { openapiSpecification } from './docs/swagger.js'
import index from './routes/index.js'

export default class Router {
    private app: express.Application

    constructor(app: express.Application) {
        this.app = app
    }

    public initRoutes = () => {
        if (process.env.NODE_ENV !== 'production') {
            this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))
        }

        this.app.get('/', index)
    }
}
