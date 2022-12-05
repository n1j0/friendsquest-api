import type { Dictionary, EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { FootprintReaction } from '../entities/footprintReaction.js'

export class FootprintReactionSeeder extends Seeder {
    async run(em: EntityManager, context: Dictionary): Promise<void> {
        em.create(FootprintReaction, {
            createdAt: new Date('2022-05-08T18:51:55.820767Z'),
            updatedAt: new Date('2022-05-08T18:51:55.820767Z'),
            createdBy: context['NFT7IF5F46eLuzKnjuLX4ZmWLTB3'],
            message: 'Ui ui ui',
            footprint: context['1eGxZv3NTmqGH8mQLaop'],
        })
    }
}
