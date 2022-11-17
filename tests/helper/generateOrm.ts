import { MikroORM } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { ORM } from '../../src/orm.js'

export const generateOrm = async (): Promise<ORM> => {
    const orm = await MikroORM.init<PostgreSqlDriver>({
        type: 'postgresql',
        entities: ['./.out/src/entities'],
        entitiesTs: ['./src/entities'],
        dbName: 'test',
    }, false)
    return {
        orm,
        forkEm: () => orm.em.fork(),
    }
}
