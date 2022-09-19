import { config } from 'dotenv'
import express, { Application, NextFunction, Request, Response } from 'express'
import swaggerUi from 'swagger-ui-express'
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { MikroORM, RequestContext } from '@mikro-orm/core' // or any other driver package

import { openapiSpecification } from './docs/swagger.js'
import mikroOrmConfig from './mikro-orm.config.js'

import index from './routes/index.js'

const orm = await MikroORM.init<PostgreSqlDriver>(mikroOrmConfig)
console.log(orm.em)

if (process.env.NODE_ENV !== 'production') {
    config()
}

const app: Application = express()
const port: number = Number.parseInt(process.env.PORT as string, 10) || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((_request: Request, _response: Response, next: NextFunction) => {
    RequestContext.create(orm.em, next)
})
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))

app.get('/', index)

try {
    app.listen(port, (): void => {
        console.log(`Connected successfully on port ${port}`)
    })
} catch (error: any) {
    console.error(`Error occurred: ${error.message}`)
}
