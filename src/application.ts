import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import { cert, initializeApp } from 'firebase-admin/app'
import Router from './router.js'
import { ORM } from './orm.js'
import { serviceAccountConfig } from './config/firebaseServiceAccount.js'

export default class Application {
    server: express.Application = express()

    router: Router

    orm: ORM

    port: number

    constructor(orm: ORM) {
        this.orm = orm
        this.router = new Router(this.server, this.orm)
        this.port = Number.parseInt(process.env.PORT as string, 10) || 3000
        initializeApp({ credential: cert(serviceAccountConfig) })
    }

    connect = async (): Promise<void> => {
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
        this.server.use(express.json())
        this.server.use(express.urlencoded({ extended: true }))
        this.server.use(helmet())
        this.server.use(cors())
        this.server.use(compression())

        this.server.disable('x-powered-by')

        this.router.initRoutes(this.port)

        try {
            this.server.listen(this.port, () => {
                console.log(`🚀 Server started: http://localhost:${this.port}`)
            })
        } catch (error: any) {
            console.error('Could not start server', error)
        }
    }
}
