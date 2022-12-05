import type { Dictionary, EntityManager, RequiredEntityData } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { User } from '../entities/user.js'

export class UserSeeder extends Seeder {
    async run(em: EntityManager, context: Dictionary): Promise<void> {
        context['39FDDRsAsZNPmocG4ZIgcnwO5BF2'] = em.create(User, {
            email: 'test@test.at',
            uid: '39FDDRsAsZNPmocG4ZIgcnwO5BF2',
            username: 'peterPan',
            friendsCode: '00000',
        } as RequiredEntityData<User>)
        context['NFT7IF5F46eLuzKnjuLX4ZmWLTB3'] = em.create(User, {
            email: 'test@test2.at',
            uid: 'NFT7IF5F46eLuzKnjuLX4ZmWLTB3',
            username: 'lauraPan',
            friendsCode: '00001',
            points: 500,
        } as RequiredEntityData<User>)
    }
}
