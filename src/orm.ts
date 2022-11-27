import { MikroORM } from '@mikro-orm/core'
import { EntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql'
import mikroOrmConfig from './config/mikro-orm.config.js'

export class ORM {
    orm: MikroORM<PostgreSqlDriver>

    private constructor(orm: MikroORM<PostgreSqlDriver>) {
        this.orm = orm
    }

    static async init() {
        return new ORM(await MikroORM.init<PostgreSqlDriver>(mikroOrmConfig))
    }

    forkEm(): EntityManager {
        return this.orm.em.fork()
    }
}
