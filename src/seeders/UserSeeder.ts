import type { EntityManager, RequiredEntityData } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { User } from '../entities/user.js'

export class UserSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        em.create(User, {
            email: 'peterpan@123.at',
            firstName: 'Peter',
            lastName: 'Pan',
            username: 'peterP',
            emailVerified: true,
            termsAccepted: true,
            accountActivated: true,
            homeland: 'Vienna',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'kevin.harizaj@gmail.com',
            createdAt: '2022-05-06T12:23:56.843524Z',
            emailVerified: true,
            updatedAt: '2022-05-06T12:23:56.843524Z',
            username: 'kevin',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'thomas@mayrhofer.at',
            createdAt: '2022-05-06T13:36:54.466567Z',
            emailVerified: true,
            updatedAt: '2022-05-06T13:36:54.466567Z',
            username: 'thomas',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'lena.heiglauer@gmx.at',
            createdAt: '2022-05-06T12:34:01.447527Z',
            emailVerified: true,
            updatedAt: '2022-05-06T12:34:01.447527Z',
            username: 'lener',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'sags-per-mail@mein.gmx',
            createdAt: '2022-05-06T12:08:10.231517Z',
            emailVerified: true,
            updatedAt: '2022-05-06T12:08:10.231517Z',
            username: 'jtpfa',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'elias.burgstaller@gmx.at',
            createdAt: '2022-05-06T09:08:27.852798Z',
            emailVerified: true,
            updatedAt: '2022-05-06T09:08:27.852798Z',
            username: 'eliburgi',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'marcelhans89@googlemail.com',
            createdAt: '2022-05-06T12:02:27.500081Z',
            emailVerified: true,
            updatedAt: '2022-05-06T12:02:27.500081Z',
            username: 'marcel98',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'tu1.app.friendsquest@gmail.com',
            createdAt: '2022-06-06T19:59:53.677629Z',
            emailVerified: true,
            updatedAt: '2022-06-06T19:59:53.677629Z',
            username: 'test',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'bjelli@gmail.com',
            createdAt: '2022-07-04T10:05:09.555099Z',
            emailVerified: true,
            updatedAt: '2022-07-04T10:05:09.555099Z',
            username: 'bjelline',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'reisingerjuli@gmail.com',
            createdAt: '2022-05-06T07:20:24.790489Z',
            emailVerified: true,
            updatedAt: '2022-05-06T07:20:24.790489Z',
            username: 'julrei',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'alymalym@web.de',
            createdAt: '2022-07-04T10:00:26.689719Z',
            emailVerified: true,
            updatedAt: '2022-07-04T10:00:26.689719Z',
            username: 'Markus',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'julia@reisinger.pro',
            createdAt: '2022-05-06T13:27:14.256713Z',
            emailVerified: true,
            updatedAt: '2022-05-06T13:27:14.256713Z',
            username: 'thdhjw',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'djdjdjdjk@gmail.at',
            createdAt: '2022-05-06T12:18:18.504911Z',
            emailVerified: true,
            updatedAt: '2022-05-06T12:18:18.504911Z',
            username: 'aaaa',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'dominik.rakowski@outlook.de',
            createdAt: '2022-05-06T12:33:15.625885Z',
            emailVerified: true,
            updatedAt: '2022-05-06T12:33:15.625885Z',
            username: 'dominik',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'thomashofer21@gmx.at',
            createdAt: '2022-05-06T13:40:03.430495Z',
            emailVerified: true,
            updatedAt: '2022-05-06T13:40:03.430495Z',
            username: 'tom',
        } as RequiredEntityData<User>)
        em.create(User, {
            email: 'jjfisch@hotmail.de',
            createdAt: '2022-05-06T12:42:53.944891Z',
            emailVerified: true,
            updatedAt: '2022-05-06T12:42:53.944891Z',
            username: 'flo',
        } as RequiredEntityData<User>)
    }
}
