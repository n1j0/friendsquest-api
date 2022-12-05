import { wrap } from '@mikro-orm/core'
import { FootprintRepositoryInterface } from './footprintRepositoryInterface.js'
import { ORM } from '../../orm.js'
import { FootprintReaction } from '../../entities/footprintReaction.js'
import { MulterFiles } from '../../types/multer.js'
import { Footprint } from '../../entities/footprint.js'
import { FootprintService } from '../../services/footprintService.js'
import { NewFootprint } from '../../types/footprint.js'
import { NotFoundError } from '../../errors/NotFoundError.js'

export class FootprintPostgresRepository implements FootprintRepositoryInterface {
    private footprintService: FootprintService

    private readonly orm: ORM

    constructor(footprintService: FootprintService, orm: ORM) {
        this.footprintService = footprintService
        this.orm = orm
    }

    createFootprint = async ({ title, latitude, longitude, files, uid }: NewFootprint) => {
        const em = this.orm.forkEm()
        const [ user, [ photoURL, audioURL ] ] = await Promise.all([
            em.findOneOrFail(
                'User',
                { uid } as any,
                { failHandler: () => { throw new NotFoundError('User') } },
            ),
            this.footprintService.uploadFilesToFireStorage(files as MulterFiles['files']),
        ])
        const footprint = new Footprint(
            title,
            user,
            latitude,
            longitude,
            photoURL,
            audioURL,
        )
        await em.persistAndFlush(footprint)
        return footprint
    }

    createFootprintReaction = async ({ id, message, uid }: { id: number | string, message: string, uid: string }) => {
        const em = this.orm.forkEm()
        const [ footprint, user ] = await Promise.all([
            em.findOneOrFail(
                'Footprint',
                { id } as any,
                { failHandler: () => { throw new NotFoundError('Footprint') } },
            ),
            em.findOneOrFail(
                'User',
                { uid } as any,
                { failHandler: () => { throw new NotFoundError('User') } },
            ),
        ])
        const reaction = new FootprintReaction(user, message, footprint)
        await em.persistAndFlush(reaction)
        return reaction
    }

    getAllFootprints = async () => {
        const em = this.orm.forkEm()
        return em.getRepository('Footprint').findAll({ populate: ['createdBy'] } as any)
    }

    getFootprintById = async (id: string | number) => {
        const em = this.orm.forkEm()
        const footprint = await em.findOneOrFail(
            'Footprint',
            { id } as any,
            { failHandler: () => { throw new NotFoundError('Footprint') } },
        )
        wrap(footprint).assign({
            viewCount: footprint.viewCount + 1,
        })
        await em.persistAndFlush(footprint)
        return footprint
    }

    getFootprintReactions = async (id: number | string) => {
        const em = this.orm.forkEm()
        return em.find(
            'FootprintReaction',
            { footprint: { id } } as any,
            { populate: ['createdBy'] } as any,
        )
    }
}
