import type { Dictionary, EntityManager } from '@mikro-orm/core'
import { Seeder } from '@mikro-orm/seeder'
import { FootprintReaction } from '../entities/footprintReaction.js'

export class FootprintReactionSeeder extends Seeder {
    async run(em: EntityManager, context: Dictionary): Promise<void> {
        em.create(FootprintReaction, {
            createdAt: '2022-05-08T18:51:55.820767Z',
            updatedAt: '2022-05-08T18:51:55.820767Z',
            createdBy: context.eliburgi,
            message: 'Krasses Ding',
            footprint: context['0yfBXY8QLnrDC3xUIgkh'],
        })
        em.create(FootprintReaction, {
            createdAt: '2022-05-06T12:37:53.716785Z',
            updatedAt: '2022-05-06T12:37:53.716785Z',
            createdBy: context.eliburgi,
            message: 'cool da war ich auchschhon nice ok',
            footprint: context['1pKAZ9BauX7vLFthQywP'],
        })
        em.create(FootprintReaction, {
            createdAt: '2022-05-06T12:20:14.201060Z',
            updatedAt: '2022-05-06T12:20:14.201060Z',
            createdBy: context.aaaa,
            message: 'moin moin',
            footprint: context['1pKAZ9BauX7vLFthQywP'],
        })
        em.create(FootprintReaction, {
            createdAt: '2022-05-06T12:25:00.214087Z',
            updatedAt: '2022-05-06T12:25:00.214087Z',
            createdBy: context.kevin,
            message: 'nice',
            footprint: context['1pKAZ9BauX7vLFthQywP'],
        })
        em.create(FootprintReaction, {
            createdAt: '2022-05-06T12:34:21.115281Z',
            updatedAt: '2022-05-06T12:34:21.115281Z',
            createdBy: context.dominik,
            message: 'sehr cool',
            footprint: context['1pKAZ9BauX7vLFthQywP'],
        })
        em.create(FootprintReaction, {
            createdAt: '2022-05-06T13:40:57.406725Z',
            updatedAt: '2022-05-06T13:40:57.406725Z',
            createdBy: context.thomas,
            message: 'nicenstein',
            footprint: context['1pKAZ9BauX7vLFthQywP'],
        })
        em.create(FootprintReaction, {
            createdAt: '2022-05-06T16:35:53.648125Z',
            updatedAt: '2022-05-06T16:35:53.648125Z',
            createdBy: context.julrei,
            message: 'liab',
            footprint: context['keI1TC8XWLT3eiIEMaof'],
        })
        em.create(FootprintReaction, {
            createdAt: '2022-05-06T16:31:57.412191Z',
            updatedAt: '2022-05-06T16:31:57.412191Z',
            createdBy: context.julrei,
            message: 'wooow',
            footprint: context['keI1TC8XWLT3eiIEMaof'],
        })
        em.create(FootprintReaction, {
            createdAt: '2022-05-06T12:30:29.633745Z',
            updatedAt: '2022-05-06T12:30:29.633745Z',
            createdBy: context.kevin,
            message: 'cool',
            footprint: context['EI9WpbWCBDSBM1vEImpk'],
        })
        em.create(FootprintReaction, {
            createdAt: '2022-06-14T10:23:55.768759Z',
            updatedAt: '2022-06-14T10:23:55.768759Z',
            createdBy: context.julrei,
            message: 'fesche anna!',
            footprint: context['WRzAbi88Z6V7G6VsMsjG'],
        })
    }
}
