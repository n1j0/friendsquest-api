import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import Router from './router.js'
import { User } from './entities/user.js'
import { Footprint } from './entities/footprint.js'
import { FootprintReaction } from './entities/footprintReaction.js'
import { $app } from './$app.js'

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
