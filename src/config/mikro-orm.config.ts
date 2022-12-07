import 'dotenv/config'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { Options } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'

export default {
    debug: true,
    tsNode: process.env.NODE_ENV !== 'production',
    entities: ['./.out/src/entities'],
    entitiesTs: ['./src/entities'],
    migrations: {
        path: './.out/src/migrations',
        pathTs: './src/migrations',
        tableName: 'migrations',
        transactional: true,
    },
    seeder: {
        path: './.out/src/seeders',
        pathTs: './src/seeders',
        defaultSeeder: 'DatabaseSeeder',
        glob: '!(*.d).{js,ts}',
        emit: 'ts',
        fileName: (className: string) => className,
    },
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbName: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT as string, 10),
    type: 'postgresql',
    metadataProvider: TsMorphMetadataProvider,
} as Options<PostgreSqlDriver>
