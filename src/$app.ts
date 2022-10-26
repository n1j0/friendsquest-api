import { EntityManager, EntityRepository, MikroORM } from '@mikro-orm/core'
import { App, cert, initializeApp, ServiceAccount } from 'firebase-admin/app'
import { getStorage, Storage } from 'firebase-admin/storage'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import mikroOrmConfig from './config/mikro-orm.config.js'
import { Footprint } from './entities/footprint.js'
import { FootprintReaction } from './entities/footprintReaction.js'
import { User } from './entities/user.js'

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
    firebase: initializeApp({ credential: cert(serviceAccount) }),
    storage: getStorage(),
} as {
    port: number,
    orm: MikroORM<PostgreSqlDriver>,
    em: EntityManager,
    footprintRepository: EntityRepository<Footprint>,
    footprintReactionRepository: EntityRepository<FootprintReaction>,
    userRepository: EntityRepository<User>,
    firebase: App,
    storage: Storage
}
