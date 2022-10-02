import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { UserSeeder } from './UserSeeder.js'
import { FootprintSeeder } from './FootprintSeeder.js'
import { FootprintReactionSeeder } from './FootprintReactionSeeder.js'

export class DatabaseSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        return this.call(em, [
            // !!order really really matters!!
            UserSeeder,
            FootprintSeeder,
            FootprintReactionSeeder,
        ])
    }
}
