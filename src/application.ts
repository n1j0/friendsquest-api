import { Application as ExpressApplication, json, urlencoded } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import { cert, initializeApp } from 'firebase-admin/app'
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import actuator from 'express-actuator'
import { Router } from './router.js'
import { ORM } from './orm.js'
import { serviceAccountConfig } from './config/firebaseServiceAccount.config.js'
import { routes } from './router/routes.js'
import { actuatorConfig } from './config/actuator.config'

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

        this.server.use(Sentry.Handlers.requestHandler())
        this.server.use(Sentry.Handlers.tracingHandler())
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

    init = async (): Promise<ExpressApplication | undefined> => {
        await this.migrate()

        this.server.use(json())
        this.server.use(urlencoded({ extended: true }))
        this.server.use(helmet())
        this.server.use(cors())
        this.server.use(compression())
        this.server.use(actuator(actuatorConfig))

        this.server.disable('x-powered-by')

        this.router.initRoutes(routes)

        try {
            // @see https://github.com/ladjs/supertest/issues/697#issuecomment-1312146374
            if (process.env.NODE_ENV !== 'testing') {
                this.server.listen(this.port)
            }
            return this.server
        } catch (error: any) {
            console.error('Could not start server', error)
            return undefined
        }
    }
}
