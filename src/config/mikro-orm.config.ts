import { config } from 'dotenv'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { Configuration, Options } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'

if (process.env.NODE_ENV !== 'production') {
    config()
}

export default {
    entities: ['./.out/entities'],
    entitiesTs: ['./src/entities'],
    dbName: process.env.DB_DATABASE,
    type: 'postgresql',
    metadataProvider: TsMorphMetadataProvider,
} as Options<PostgreSqlDriver> | Configuration<PostgreSqlDriver>
