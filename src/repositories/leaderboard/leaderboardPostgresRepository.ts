import { ORM } from '../../orm'
import { LeaderboardRepositoryInterface } from './leaderboardRepositoryInterface.js'

export class LeaderboardPostgresRepository implements LeaderboardRepositoryInterface {
    private readonly orm: ORM

    constructor(orm: ORM) {
        this.orm = orm
    }

    getTop100 = async () => {
        const em = this.orm.forkEm()
        return em.find('User', {}, { limit: 100, orderBy: [{ points: 'desc' }] })
    }
}
