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
        } as RequiredEntityData<User>)
        context['86Tu5feimgMLOJ1JHpKAUmaG4wV2'] = em.create(User, {
            email: 'kevin.harizaj@gmail.com',
            uid: '86Tu5feimgMLOJ1JHpKAUmaG4wV2',
            createdAt: '2022-05-06T12:23:56.843524Z',
            updatedAt: '2022-05-06T12:23:56.843524Z',
            username: 'kevin',
            friendsCode: '00002',
        } as RequiredEntityData<User>)
        context['8eBoGksf7XQtn0gj11GaHrmc3dX2'] = em.create(User, {
            email: 'thomas@mayrhofer.at',
            uid: '8eBoGksf7XQtn0gj11GaHrmc3dX2',
            createdAt: '2022-05-06T13:36:54.466567Z',
            updatedAt: '2022-05-06T13:36:54.466567Z',
            username: 'thomas',
            friendsCode: '00003',
        } as RequiredEntityData<User>)
        context['BluuGruwMfaAy99BLYyhyfNQktu2'] = em.create(User, {
            email: 'lena.heiglauer@gmx.at',
            uid: 'BluuGruwMfaAy99BLYyhyfNQktu2',
            createdAt: '2022-05-06T12:34:01.447527Z',
            updatedAt: '2022-05-06T12:34:01.447527Z',
            username: 'lener',
            friendsCode: '00004',
        } as RequiredEntityData<User>)
        context['FhsDLCfvnRecYq0Z1LB7uNx6OzV2'] = em.create(User, {
            email: 'sags-per-mail@mein.gmx',
            uid: 'FhsDLCfvnRecYq0Z1LB7uNx6OzV2',
            createdAt: '2022-05-06T12:08:10.231517Z',
            updatedAt: '2022-05-06T12:08:10.231517Z',
            username: 'jtpfa',
            friendsCode: '00005',
        } as RequiredEntityData<User>)
        context['FjKDIEQvWscXjDMAmNfITK3HpN42'] = em.create(User, {
            email: 'elias.burgstaller@gmx.at',
            uid: 'FjKDIEQvWscXjDMAmNfITK3HpN42',
            createdAt: '2022-05-06T09:08:27.852798Z',
            updatedAt: '2022-05-06T09:08:27.852798Z',
            username: 'eliburgi',
            friendsCode: '00006',
        } as RequiredEntityData<User>)
        context['FznIzkaDFLULTHPy5DCdFfA473w1'] = em.create(User, {
            email: 'marcelhans89@googlemail.com',
            uid: 'FznIzkaDFLULTHPy5DCdFfA473w1',
            createdAt: '2022-05-06T12:02:27.500081Z',
            updatedAt: '2022-05-06T12:02:27.500081Z',
            username: 'marcel98',
            friendsCode: '00007',
        } as RequiredEntityData<User>)
        context['M6JCFPQ3JPXsepF9LekbnabMvwc2'] = em.create(User, {
            email: 'tu1.app.friendsquest@gmail.com',
            uid: 'M6JCFPQ3JPXsepF9LekbnabMvwc2',
            createdAt: '2022-06-06T19:59:53.677629Z',
            updatedAt: '2022-06-06T19:59:53.677629Z',
            username: 'test',
            friendsCode: '00008',
        } as RequiredEntityData<User>)
        context['PhADaouxlzPc6rHv2vKkGFryM7V2'] = em.create(User, {
            email: 'bjelli@gmail.com',
            uid: 'PhADaouxlzPc6rHv2vKkGFryM7V2',
            createdAt: '2022-07-04T10:05:09.555099Z',
            updatedAt: '2022-07-04T10:05:09.555099Z',
            username: 'bjelline',
            friendsCode: '00009',
        } as RequiredEntityData<User>)
        context['UNJkNmUUDzUzDQI47nTZupFjYaf2'] = em.create(User, {
            email: 'reisingerjuli@gmail.com',
            uid: 'UNJkNmUUDzUzDQI47nTZupFjYaf2',
            createdAt: '2022-05-06T07:20:24.790489Z',
            updatedAt: '2022-05-06T07:20:24.790489Z',
            username: 'julrei',
            friendsCode: '0000A',
        } as RequiredEntityData<User>)
        context['WtISXJI9AXYGkJMuXW1th1BG9gU2'] = em.create(User, {
            email: 'julia@reisinger.pro',
            uid: 'WtISXJI9AXYGkJMuXW1th1BG9gU2',
            createdAt: '2022-05-06T13:27:14.256713Z',
            updatedAt: '2022-05-06T13:27:14.256713Z',
            username: 'thdhjw',
            friendsCode: '0000B',
        } as RequiredEntityData<User>)
        context['d4FR9aldNwX7vMzsgm35cXIiKWk1'] = em.create(User, {
            email: 'djdjdjdjk@gmail.at',
            uid: 'd4FR9aldNwX7vMzsgm35cXIiKWk1',
            createdAt: '2022-05-06T12:18:18.504911Z',
            updatedAt: '2022-05-06T12:18:18.504911Z',
            username: 'aaaa',
            friendsCode: '0000C',
        } as RequiredEntityData<User>)
        context['h5KPMw0obScf8FJ2QbLUMtgvLJV2'] = em.create(User, {
            email: 'dominik.rakowski@outlook.de',
            uid: 'h5KPMw0obScf8FJ2QbLUMtgvLJV2',
            createdAt: '2022-05-06T12:33:15.625885Z',
            updatedAt: '2022-05-06T12:33:15.625885Z',
            username: 'dominik',
            friendsCode: '0000D',
        } as RequiredEntityData<User>)
    }
}
