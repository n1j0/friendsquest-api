import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { User } from '../entities/user.js'

export class UserSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        em.create(User, {
            name: 'Peter Pan',
        })
    }
}
