import { Application as ExpressApplication, json, urlencoded } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import { cert, initializeApp } from 'firebase-admin/app'
import { Router } from './router.js'
import { ORM } from './orm.js'
import { serviceAccountConfig } from './config/firebaseServiceAccount.js'
import { routes } from './router/routes.js'

export default class Application {
    server: ExpressApplication

    router: Router

    orm: ORM

    port: number

    constructor(orm: ORM, server: ExpressApplication) {
        this.orm = orm
        this.server = server
        this.router = new Router(this.server, this.orm)
        this.port = Number.parseInt(process.env.PORT as string, 10)
        initializeApp({ credential: cert(serviceAccountConfig) })
    }

    migrate = async (): Promise<void> => {
        try {
            const migrator = this.orm.orm.getMigrator()
            const migrations = await migrator.getPendingMigrations()
            if (migrations && migrations.length > 0) {
                await migrator.up()
            }
        } catch (error: any) {
            console.error(`Error occurred: ${error.message}`)
        }
    }

    init = (): void => {
        this.server.use(json())
        this.server.use(urlencoded({ extended: true }))
        this.server.use(helmet())
        this.server.use(cors())
        this.server.use(compression())

        this.server.disable('x-powered-by')

        this.router.initRoutes(this.port, routes)

        try {
            this.server.listen(this.port)
        } catch (error: any) {
            console.error('Could not start server', error)
        }
    }
}
