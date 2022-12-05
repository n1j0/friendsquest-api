import { wrap } from '@mikro-orm/core'
import { FootprintRepositoryInterface } from './footprintRepositoryInterface.js'
import { ORM } from '../../orm.js'
import { FootprintReaction } from '../../entities/footprintReaction.js'
import { MulterFiles } from '../../types/multer.js'
import { Footprint } from '../../entities/footprint.js'
import { FootprintService } from '../../services/footprintService.js'
import { NewFootprint } from '../../types/footprint.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { UserRepositoryInterface } from '../user/userRepositoryInterface.js'
import Points from '../../constants/points'

export class FootprintPostgresRepository implements FootprintRepositoryInterface {
    private footprintService: FootprintService

    private userRepository: UserRepositoryInterface

    private readonly orm: ORM

    constructor(footprintService: FootprintService, userRepository: UserRepositoryInterface, orm: ORM) {
        this.footprintService = footprintService
        this.userRepository = userRepository
        this.orm = orm
    }

    private findFootprintById = async (id: number | string) => {
        const em = this.orm.forkEm()
        return em.findOneOrFail(
            'Footprint',
            { id } as any,
            { failHandler: () => { throw new NotFoundError() } },
        )
    }

    createFootprint = async ({ title, latitude, longitude, files, uid }: NewFootprint) => {
        const em = this.orm.forkEm()
        const [ user, [ photoURL, audioURL ] ] = await Promise.all([
            this.userRepository.getUserByUid(uid),
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
            this.findFootprintById(id),
            this.userRepository.getUserByUid(uid),
        ])
        const reaction = new FootprintReaction(user, message, footprint)
        await em.persistAndFlush(reaction)
        return reaction
    }

    getAllFootprints = async () => {
        const em = this.orm.forkEm()
        return em.getRepository('Footprint').findAll({ populate: ['createdBy'] } as any)
    }

    getFootprintById = async (uid: string, id: string | number) => {
        const em = this.orm.forkEm()
        const footprint = await this.findFootprintById(id)
        wrap(footprint).assign({
            viewCount: footprint.viewCount + 1,
        })
        await Promise.all([
            em.persistAndFlush(footprint),
            this.userRepository.addPoints(uid, Points.FOOTPRINT_VIEWED),
        ])
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
