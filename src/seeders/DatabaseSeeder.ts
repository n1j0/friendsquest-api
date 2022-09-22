import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { BookSeeder } from './BookSeeder.js'

export class DatabaseSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        await new BookSeeder().run(em)
    }
}
