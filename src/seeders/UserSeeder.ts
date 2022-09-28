import type {EntityManager, RequiredEntityData} from '@mikro-orm/core'
import {Seeder} from '@mikro-orm/seeder'
import {User} from '../entities/user.js'

export class UserSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        em.create(User, {
            email: 'peterpan@123.at',
            firstName: 'Peter',
            lastName: 'Pan',
            userName: 'peterP',
            emailVerified: true,
            termsAccepted: true,
            accountActivated: true,
            homeland: 'Vienna',
        } as RequiredEntityData<User>)
    }
}
