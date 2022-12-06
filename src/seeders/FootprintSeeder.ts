import type { Dictionary, EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { Footprint } from '../entities/footprint.js'

export class FootprintSeeder extends Seeder {
    async run(em: EntityManager, context: Dictionary): Promise<void> {
        context['1eGxZv3NTmqGH8mQLaop'] = em.create(Footprint, {
            createdAt: new Date('2022-05-06T18:57:36.164593Z'),
            updatedAt: new Date('2022-05-06T18:57:36.164593Z'),
            createdBy: context['39FDDRsAsZNPmocG4ZIgcnwO5BF2'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP8581917939745183878.jpg?alt=media&token=4c705905-10f5-4033-8835-cc3bb7310199',
            latitude: '47.723738',
            longitude: '13.088369',
            title: 'Hello world',
        })
    }
}
