import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import Router from './router.js'
import { $app } from './$app.js'

export default class Application {
    public server: express.Application = express()

    public router: Router | undefined

    public connect = async (): Promise<void> => {
        try {
            const migrator = $app.orm.getMigrator()
            const migrations = await migrator.getPendingMigrations()
            if (migrations && migrations.length > 0) {
                await migrator.up()
            }
        } catch (error: any) {
            console.error(`Error occurred: ${error.message}`)
        }
    }

    public init = (): void => {
        $app.em = $app.orm.em

        this.server.use(express.json())
        this.server.use(express.urlencoded({ extended: true }))
        this.server.use(helmet())
        this.server.use(cors())
        this.server.use(compression())

        this.server.disable('x-powered-by')

        this.router = new Router(this.server, $app.orm)
        this.router.initRoutes()

        try {
            this.server.listen($app.port, () => {
                console.log(`🚀 Server started: http://localhost:${$app.port}`)
            })
        } catch (error: any) {
            console.error('Could not start server', error)
        }
    }
}
