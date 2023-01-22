import type { Dictionary, EntityManager, RequiredEntityData } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { User } from '../entities/user.js'

export class UserSeeder extends Seeder {
    async run(em: EntityManager, context: Dictionary): Promise<void> {
        context['Uj0Snu6MePcpWJ2dBmNGEdUqt8n2'] = em.create(User, {
            email: 'test@test.at',
            uid: 'Uj0Snu6MePcpWJ2dBmNGEdUqt8n2',
            username: 'peterPan',
            friendsCode: '00000',
        } as RequiredEntityData<User>)
        context['RqWiQwRApsWosyfZOoSBttk2rn12'] = em.create(User, {
            email: 'test@test2.at',
            uid: 'RqWiQwRApsWosyfZOoSBttk2rn12',
            username: 'lauraPan',
            friendsCode: '00001',
        } as RequiredEntityData<User>)
    }
}
