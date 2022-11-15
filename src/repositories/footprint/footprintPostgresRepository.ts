import { FootprintRepositoryInterface } from './footprintRepositoryInterface.js'
import { $app } from '../../$app.js'
import { FootprintReaction } from '../../entities/footprintReaction.js'
import { MulterFiles } from '../../types/multer.js'
import { Footprint } from '../../entities/footprint.js'
import { FootprintService } from '../../services/footprintService.js'
import { NewFootprint } from '../../types/footprint.js'

export class FootprintPostgresRepository implements FootprintRepositoryInterface {
    private footprintService: FootprintService

    constructor(footprintService: FootprintService) {
        this.footprintService = footprintService
    }

    createFootprint = async ({ title, latitude, longitude, files, uid }: NewFootprint) => {
        const em = $app.em.fork()
        const user = await em.findOneOrFail('User', { uid } as any)
        const [ photoURL, audioURL ] = await this
            .footprintService
            .uploadFilesToFireStorage(files as MulterFiles['files'])
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

    createFootprintReaction = async (id: number | string, message: string, uid: string) => {
        const em = $app.em.fork()
        const footprint = await em.findOneOrFail('Footprint', { id } as any)
        const user = await em.findOneOrFail('User', { uid } as any)
        const reaction = new FootprintReaction(user, message, footprint)
        await em.persistAndFlush(reaction)
        return reaction
    }

    getAllFootprints = async () => {
        const em = $app.em.fork()
        return em.getRepository('Footprint').findAll({ populate: ['createdBy'] } as any)
    }

    // TODO: should getFootprint include the reactions?
    // TODO: every time this is called the viewCount needs to be increased
    getFootprintById = async (id: string | number) => {
        const em = $app.em.fork()
        return em.findOne('Footprint', { id } as any)
    }

    getFootprintReactions = async (id: number | string) => {
        const em = $app.em.fork()
        return em.find(
            'FootprintReaction',
            { footprint: { id } } as any,
            { populate: ['createdBy'] } as any,
        )
    }
}
