import type { EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { Book } from '../entities/book.js'

export class BookSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        em.create(Book, {
            name: 'The book',
        })
    }
}
