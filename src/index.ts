import { config } from 'dotenv'
import express, { Application } from 'express'
import swaggerUi from 'swagger-ui-express'

import { openapiSpecification } from './docs/swagger.js'

import index from './routes/index.js'

if (process.env.NODE_ENV !== 'production') {
    config()
}

const app: Application = express()
const port: number = Number.parseInt(process.env.PORT as string, 10) || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))

app.get('/', index)

try {
    app.listen(port, (): void => {
        console.log(`Connected successfully on port ${port}`)
    })
} catch (error: any) {
    console.error(`Error occurred: ${error.message}`)
}
