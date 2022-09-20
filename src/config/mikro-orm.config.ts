import { config } from 'dotenv'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { Options } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'

if (process.env.NODE_ENV !== 'production') {
    config()
}

export default {
    debug: process.env.NODE_ENV !== 'production',
    tsNode: process.env.NODE_ENV !== 'production',
    entities: ['./.out/entities'],
    entitiesTs: ['./src/entities'],
    migrations: {
        path: './.out/migrations',
        pathTs: './src/migrations',
        tableName: 'migrations',
        transactional: true,
    },
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT as string, 10) || 5432,
    type: 'postgresql',
    metadataProvider: TsMorphMetadataProvider,
} as Options<PostgreSqlDriver>
