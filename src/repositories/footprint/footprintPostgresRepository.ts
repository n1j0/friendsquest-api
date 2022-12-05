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
            em.findOneOrFail('User', { uid } as any),
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
            em.findOneOrFail('Footprint', { id } as any),
            em.findOneOrFail('User', { uid } as any),
        ])
        const reaction = new FootprintReaction(user, message, footprint)
        await em.persistAndFlush(reaction)
        return reaction
    }

    getAllFootprints = async () => {
        const em = this.orm.forkEm()
        return em.getRepository('Footprint').findAll({ populate: ['createdBy'] } as any)
    }

    // TODO: should getFootprint include the reactions?
    // TODO: every time this is called the viewCount needs to be increased
    getFootprintById = async (id: string | number) => {
        const em = this.orm.forkEm()
        return em.findOneOrFail(
            'Footprint',
            { id } as any,
            { failHandler: () => { throw new NotFoundError() } },
        )
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
