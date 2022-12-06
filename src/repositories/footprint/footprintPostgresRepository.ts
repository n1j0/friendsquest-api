import { FootprintRepositoryInterface } from './footprintRepositoryInterface.js'
import { ORM } from '../../orm.js'
import { FootprintReaction } from '../../entities/footprintReaction.js'
import { MulterFiles } from '../../types/multer.js'
import { Footprint } from '../../entities/footprint.js'
import { FootprintService } from '../../services/footprintService.js'
import { NewFootprint } from '../../types/footprint.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { UserRepositoryInterface } from '../user/userRepositoryInterface.js'
import Points from '../../constants/points.js'
import { FriendshipRepositoryInterface } from '../friendship/friendshipRepositoryInterface.js'

export class FootprintPostgresRepository implements FootprintRepositoryInterface {
    private readonly footprintService: FootprintService

    private readonly userRepository: UserRepositoryInterface

    private readonly friendshipRepository: FriendshipRepositoryInterface

    private readonly orm: ORM

    constructor(
        footprintService: FootprintService,
        userRepository: UserRepositoryInterface,
        friendshipRepository: FriendshipRepositoryInterface,
        orm: ORM,
    ) {
        this.footprintService = footprintService
        this.userRepository = userRepository
        this.friendshipRepository = friendshipRepository
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
        await this.userRepository.addPoints(uid, Points.FOOTPRINT_CREATED)
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
        await this.userRepository.addPoints(uid, Points.FOOTPRINT_REACTION)
        return reaction
    }

    getAllFootprints = async () => {
        const em = this.orm.forkEm()
        return em.getRepository('Footprint').findAll({ populate: ['createdBy'] } as any)
    }

    getFootprintsOfFriendsAndUser = async (uid: string) => {
        const em = this.orm.forkEm()
        const user = await this.userRepository.getUserByUid(uid)
        const friendships = await this.friendshipRepository.getFriendshipsWithSpecifiedOptions(
            user,
            { fields: [{ invitor: ['id'] }, { invitee: ['id'] }] },
        )
        const friends = friendships.map(
            friendship => (friendship.invitor.id === user.id ? friendship.invitee.id : friendship.invitor.id),
        )
        return em.find('Footprint', { createdBy: [ user, ...friends ] } as any, { populate: ['createdBy'] } as any)
    }

    getFootprintById = async (uid: string, id: string | number) => {
        const em = this.orm.forkEm()
        const [ footprint, user ] = await Promise.all([
            this.findFootprintById(id),
            this.userRepository.getUserByUid(uid),
        ])
        footprint.users.add(user)
        try {
            await em.persistAndFlush(footprint)
            await this.userRepository.addPoints(uid, Points.FOOTPRINT_VIEWED)
            return this.findFootprintById(id)
        } catch {
            return footprint
        }
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
