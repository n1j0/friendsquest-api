import { EntityManager, EntityRepository, MikroORM } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import express from 'express'
import mikroOrmConfig from './config/mikro-orm.config.js'
import Router from './router.js'
import { Book } from './entities/book.js'

export const $app = {
    port: Number.parseInt(process.env.PORT as string, 10) || 3000,
    orm: await MikroORM.init(mikroOrmConfig),
} as {
    port: number,
    orm: MikroORM<PostgreSqlDriver>,
    em: EntityManager,
    bookRepository: EntityRepository<Book>,
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
        $app.bookRepository = $app.em.getRepository(Book)

        this.server.use(express.json())
        this.server.use(express.urlencoded({ extended: true }))

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
