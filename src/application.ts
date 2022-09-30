import { EntityManager, EntityRepository, MikroORM } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { initializeApp, cert } from 'firebase-admin/app'
import mikroOrmConfig from './config/mikro-orm.config.js'
import Router from './router.js'
import { User } from './entities/user.js'
import { Footprint } from './entities/footprint.js'
import { FootprintReaction } from './entities/footprintReaction.js'

interface ServiceAccount{
    type: string,
    project_id: string
    private_key_id: string,
    private_key: string,
    client_email: string,
    client_id: string,
    auth_uri: string
    token_uri: string,
    auth_provider_x509_cert_url: string,
    client_x509_cert_url: string,
}

const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
    // See: https://stackoverflow.com/a/50376092/3403247.
    private_key: (process.env.FIREBASE_ADMIN_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL,
} as ServiceAccount

export const $app = {
    port: Number.parseInt(process.env.PORT as string, 10) || 3000,
    orm: await MikroORM.init(mikroOrmConfig),
    firebase: initializeApp({ credential: cert(serviceAccount as any) }),
} as {
    port: number,
    orm: MikroORM<PostgreSqlDriver>,
    em: EntityManager,
    footprintRepository: EntityRepository<Footprint>,
    footprintReactionRepository: EntityRepository<FootprintReaction>,
    userRepository: EntityRepository<User>,
    firebase: any
  }

export default class Application {
    public server: express.Application = express()

    // eslint-disable-next-line class-methods-use-this
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
        $app.userRepository = $app.em.getRepository(User)
        $app.footprintRepository = $app.em.getRepository(Footprint)
        $app.footprintReactionRepository = $app.em.getRepository(FootprintReaction)

        this.server.use(express.json())
        this.server.use(express.urlencoded({ extended: true }))
        this.server.use(helmet())
        this.server.use(cors())

        this.server.disable('x-powered-by')

        new Router(this.server, $app.orm).initRoutes()

        try {
            this.server.listen($app.port, () => {
                console.log(`🚀 Server started: http://localhost:${$app.port}`)
            })
        } catch (error: any) {
            console.error('Could not start server', error)
        }
    }
}
