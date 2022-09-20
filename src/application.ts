import { MikroORM } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import express from 'express'
import mikroOrmConfig from './config/mikro-orm.config.js'
import Router from './router.js'

export default class Application {
    public orm: MikroORM<PostgreSqlDriver> | undefined

    public app: express.Application = express()

    public connect = async (): Promise<void> => {
        try {
            this.orm = await MikroORM.init(mikroOrmConfig)
            const migrator = this.orm.getMigrator()
            const migrations = await migrator.getPendingMigrations()
            if (migrations && migrations.length > 0) {
                await migrator.up()
            }
        } catch (error: any) {
            console.error(`Error occurred: ${error.message}`)
        }
    }

    public init = (): void => {
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))

        new Router(this.app, this.orm as MikroORM<PostgreSqlDriver>).initRoutes()

        try {
            const port: number = Number.parseInt(process.env.PORT as string, 10) || 3000
            this.app.listen(port, () => {
                console.log(`🚀 http://localhost:${port}`)
            })
        } catch (error: any) {
            console.error('Could not start server', error)
        }
    }
}
