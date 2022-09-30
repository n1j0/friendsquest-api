import type { Dictionary, EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { Footprint } from '../entities/footprint.js'

export class FootprintSeeder extends Seeder {
    async run(em: EntityManager, context: Dictionary): Promise<void> {
        context['1eGxZv3NTmqGH8mQLaop'] = em.create(Footprint, {
            createdAt: '2022-05-06T18:57:36.164593Z',
            updatedAt: '2022-05-06T18:57:36.164593Z',
            createdBy: context['39FDDRsAsZNPmocG4ZIgcnwO5BF2'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP8581917939745183878.jpg?alt=media&token=4c705905-10f5-4033-8835-cc3bb7310199',
            latitude: '47.723738',
            longitude: '13.088369',
            viewCount: 0,
            title: 'Hello world',
        })
        context['T8oqGHZvmQLaGp1emx3N'] = em.create(Footprint, {
            createdAt: '2022-05-03T18:52:36.164593Z',
            updatedAt: '2022-05-03T18:52:36.164593Z',
            createdBy: context['39FDDRsAsZNPmocG4ZIgcnwO5BF2'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP8581917939745183878.jpg?alt=media&token=4c705905-10f5-4033-8835-cc3bb7310199',
            latitude: '47.724071',
            longitude: '13.086448',
            viewCount: 0,
            title: '',
        })
        context['0yfBXY8QLnrDC3xUIgkh'] = em.create(Footprint, {
            createdAt: '2022-05-08T18:51:36.164593Z',
            updatedAt: '2022-05-08T18:51:36.164593Z',
            createdBy: context['FjKDIEQvWscXjDMAmNfITK3HpN42'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP8581917939745183878.jpg?alt=media&token=4c705905-10f5-4033-8835-cc3bb7310199',
            latitude: '47.8074161',
            longitude: '13.0173758',
            viewCount: 0,
            title: '',
        })
        context['1pKAZ9BauX7vLFthQywP'] = em.create(Footprint, {
            createdAt: '2022-05-06T11:06:35.627905Z',
            updatedAt: '2022-05-06T11:06:35.627905Z',
            createdBy: context['UNJkNmUUDzUzDQI47nTZupFjYaf2'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP1344309820112435077.jpg?alt=media&token=b78c6919-467d-4c7a-810f-f1c4d2528219',
            latitude: '47.7233724',
            longitude: '13.0864605',
            viewCount: 0,
            title: 'Testing',
        })
        context['32sd07rsRb95Yh6miCig'] = em.create(Footprint, {
            createdAt: '2022-05-06T15:04:15.796002Z',
            updatedAt: '2022-05-06T15:04:15.796002Z',
            createdBy: context['UNJkNmUUDzUzDQI47nTZupFjYaf2'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP6467368998684294167.jpg?alt=media&token=e072bb58-3a92-45d9-8bf8-5ddd3c5a0efa',
            latitude: '47.7228223',
            longitude: '13.0878516',
            viewCount: 0,
            title: 'Studiowoche überlebt',
            description: '💪💯',
        })
        context['7TtrhxgKdFjfPA65uLz4'] = em.create(Footprint, {
            createdAt: '2022-05-09T08:46:49.579798Z',
            updatedAt: '2022-05-09T08:46:49.579798Z',
            createdBy: context['UNJkNmUUDzUzDQI47nTZupFjYaf2'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP6467368998684294167.jpg?alt=media&token=e072bb58-3a92-45d9-8bf8-5ddd3c5a0efa',
            latitude: '47.7068838',
            longitude: '13.2975921',
            viewCount: 0,
            title: 'Feichtenstoa wandern',
            description: 'in Hintersee mit da Dani 💪',
        })
        context['7sEKb0oAbTtZTJnc2UTe'] = em.create(Footprint, {
            createdAt: '2022-05-06T12:03:56.109464Z',
            updatedAt: '2022-05-06T12:03:56.109464Z',
            createdBy: context['FznIzkaDFLULTHPy5DCdFfA473w1'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP1343464759335504405.jpg?alt=media&token=7b9dd6f3-6bc9-47bc-a514-80bbf214eb09',
            latitude: '47.7233729',
            longitude: '13.0864611',
            viewCount: 0,
            title: 'Tischtennis',
        })
        context['B2uJ3EX3NPvIFNJwcWyl'] = em.create(Footprint, {
            createdAt: '2022-05-06T16:38:29.996530Z',
            updatedAt: '2022-05-06T16:38:29.996530Z',
            createdBy: context['UNJkNmUUDzUzDQI47nTZupFjYaf2'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP5662388632999030781.jpg?alt=media&token=ef7e0625-e4cd-449a-a464-95b15db9ce20',
            latitude: '47.8242598',
            longitude: '13.0466002',
            viewCount: 0,
            title: 'Geburtstagsfeier',
            description: 'Familien Zeit',
        })
        context['CBBPoUjwpeKNAk6JcbhE'] = em.create(Footprint, {
            createdAt: '2022-05-06T13:28:25.343291Z',
            updatedAt: '2022-05-06T13:28:25.343291Z',
            createdBy: context['WtISXJI9AXYGkJMuXW1th1BG9gU2'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP2981795891402367004.jpg?alt=media&token=a8ecebdd-9782-40f4-8bbb-ca8a04fe6b65',
            latitude: '47.7233746',
            longitude: '13.0864645',
            viewCount: 0,
            title: 'Teat',
            description: 'user testing',
        })
        context['EI9WpbWCBDSBM1vEImpk'] = em.create(Footprint, {
            createdAt: '2022-05-06T12:29:58.781709Z',
            updatedAt: '2022-05-06T12:29:58.781709Z',
            createdBy: context['86Tu5feimgMLOJ1JHpKAUmaG4wV2'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP5425584259754010255.jpg?alt=media&token=470c1fb3-40c3-46d3-9e94-cb9bed47ec9e',
            latitude: '47.7233721',
            longitude: '13.0864579',
            viewCount: 0,
            title: 'die station',
            description: 'kaffee',
        })
        context['EevJrtmzs9silkqpYhS1'] = em.create(Footprint, {
            createdAt: '2022-05-06T12:23:28.679722Z',
            updatedAt: '2022-05-06T12:23:28.679722Z',
            createdBy: context['d4FR9aldNwX7vMzsgm35cXIiKWk1'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP5827224031061085198.jpg?alt=media&token=b8c6d777-3048-4c1a-9476-e4d9f6e2b354',
            latitude: '47.7233722',
            longitude: '13.0864566',
            viewCount: 0,
            title: 'schicker fuß',
            description: '😀😀😀😀😀',
        })
        context['NtwtvVKEPwW2Rwh9UTdS'] = em.create(Footprint, {
            createdAt: '2022-05-06T12:27:32.298252Z',
            updatedAt: '2022-05-06T12:27:32.298252Z',
            createdBy: context['FjKDIEQvWscXjDMAmNfITK3HpN42'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP8904189831294132903.jpg?alt=media&token=bd5bacd1-b15c-4a5b-8d74-5d7ee78f0552',
            latitude: '47.7233738',
            longitude: '13.0864607',
            viewCount: 0,
            title: 'u10',
            description: 'User testing',
        })
        context['WRzAbi88Z6V7G6VsMsjG'] = em.create(Footprint, {
            createdAt: '2022-06-14T10:23:12.496139Z',
            updatedAt: '2022-06-14T10:23:12.496139Z',
            createdBy: context['UNJkNmUUDzUzDQI47nTZupFjYaf2'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP3095091243403449638.jpg?alt=media&token=6c2cc2ba-82c4-4a44-8496-aab2baa2acbe',
            latitude: '52.500347',
            longitude: '13.2698126',
            viewCount: 0,
            title: 'WeAreDevelopers',
            description: 'Berlin yea',
        })
        context['keI1TC8XWLT3eiIEMaof'] = em.create(Footprint, {
            createdAt: '2022-05-06T16:30:46.425551Z',
            updatedAt: '2022-05-06T16:30:46.425551Z',
            createdBy: context['UNJkNmUUDzUzDQI47nTZupFjYaf2'],
            audioURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/audios%2Fsample-15s.mp3?alt=media&token=1ca1f055-a423-4f0b-b3ed-10b1b9955edf',
            imageURL: 'https://firebasestorage.googleapis.com/v0/b/friends-quest.appspot.com/o/footprints%2Fdata%2Fuser%2F0%2Fat.friendsquest.app%2Fcache%2FCAP3827971371199816707.jpg?alt=media&token=c84ab887-5eae-4b71-99c0-6f302c970ab5',
            latitude: '47.8241703',
            longitude: '13.046677',
            viewCount: 0,
            title: 'Party',
            description: 'fette partyyyy 💥🔥🎉🎊🥳',
        })
    }
}
