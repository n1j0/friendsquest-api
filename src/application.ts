import { Application as ExpressApplication, json, urlencoded } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import { cert, initializeApp } from 'firebase-admin/app'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import * as http from 'node:http'
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
        initializeApp({
            credential: cert(serviceAccountConfig),
            storageBucket: `gs://${process.env.FIREBASE_STORAGE_BUCKET}/`,
        })
        this.initSentry()
    }

    initSentry(): void {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            integrations: [
                // enable HTTP calls tracing
                new Sentry.Integrations.Http({ tracing: true }),
                // enable Express.js middleware tracing
                new Tracing.Integrations.Express({ app: this.server }),
            ],

            tracesSampleRate: 1,
            release: `friendsquest-api@${process.env.npm_package_version}`,
        })
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

    init = async (): Promise<http.Server | undefined> => {
        await this.migrate()

        this.server.use(json())
        this.server.use(urlencoded({ extended: true }))
        this.server.use(helmet())
        this.server.use(cors())
        this.server.use(compression())
        this.server.use(Sentry.Handlers.requestHandler())
        this.server.use(Sentry.Handlers.tracingHandler())

        this.server.disable('x-powered-by')

        this.router.initRoutes(routes)

        try {
            return this.server.listen(this.port)
        } catch (error: any) {
            console.error('Could not start server', error)
            return undefined
        }
    }
}
