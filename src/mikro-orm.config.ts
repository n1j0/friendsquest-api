import { config } from 'dotenv'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { Configuration, Options } from '@mikro-orm/core'

if (process.env.NODE_ENV !== 'production') {
    config()
}

export default {
    entities: ['./.out/entities'],
    entitiesTs: ['./src/entities'],
    dbName: process.env.DB_DATABASE,
    type: 'postgresql',
} as Options<PostgreSqlDriver> | Configuration<PostgreSqlDriver>
