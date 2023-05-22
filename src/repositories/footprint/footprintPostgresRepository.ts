import { FootprintRepositoryInterface } from './footprintRepositoryInterface.js'
import { ORM } from '../../orm.js'
import { FootprintReaction } from '../../entities/footprintReaction.js'
import { Footprint } from '../../entities/footprint.js'
import { FootprintService } from '../../services/footprintService.js'
import { NewFootprint } from '../../types/footprint.js'
import { NotFoundError } from '../../errors/NotFoundError.js'
import { UserRepositoryInterface } from '../user/userRepositoryInterface.js'
import Points from '../../constants/points.js'
import { FriendshipRepositoryInterface } from '../friendship/friendshipRepositoryInterface.js'
import { FriendshipStatus } from '../../constants/index.js'
import { ForbiddenError } from '../../errors/ForbiddenError.js'
import { DeletionService } from '../../services/deletionService.js'

export class FootprintPostgresRepository implements FootprintRepositoryInterface {
    private readonly footprintService: FootprintService

    private readonly deletionService: DeletionService

    private readonly userRepository: UserRepositoryInterface

    private readonly friendshipRepository: FriendshipRepositoryInterface

    private readonly orm: ORM

    constructor(
        footprintService: FootprintService,
        deletionService: DeletionService,
        userRepository: UserRepositoryInterface,
        friendshipRepository: FriendshipRepositoryInterface,
        orm: ORM,
    ) {
        this.footprintService = footprintService
        this.deletionService = deletionService
        this.userRepository = userRepository
        this.friendshipRepository = friendshipRepository
        this.orm = orm
    }

    findFootprintById = async (id: number | string): Promise<Footprint> => {
        const em = this.orm.forkEm()
        return em.findOneOrFail(
            'Footprint',
            { id } as any,
            { failHandler: () => { throw new NotFoundError() },
                populate: ['createdBy'] } as any,
        )
    }

    createFootprint = async ({ title, description, latitude, longitude, files, uid }: NewFootprint) => {
        const em = this.orm.forkEm()
        const [ user, [ photoURL, audioURL ] ] = await Promise.all([
            this.userRepository.getUserByUid(uid),
            this.footprintService.uploadFilesToFireStorage(files, uid),
        ])
        const temperatureData = await this
            .footprintService
            .getTemperature(latitude, longitude)
        const temperature = temperatureData?.main?.temp
        const footprint = new Footprint(
            title,
            user,
            latitude,
            longitude,
            photoURL,
            audioURL,
            temperature,
        )
        let footprintWithDescription = footprint
        if (description) {
            footprintWithDescription = em.assign(footprint, { description })
        }
        await em.persistAndFlush(footprintWithDescription)
        const userWithUpdatedPoints = await this.userRepository.addPoints(uid, Points.FOOTPRINT_CREATED)
        return {
            footprint: footprintWithDescription,
            points: Points.FOOTPRINT_CREATED,
            userPoints: userWithUpdatedPoints.points,
        }
    }

    // eslint-disable-next-line max-len
    hasUserReactedToOrCreatedFootprint = async (reactions : FootprintReaction[], footprint: Footprint, userId: number) => {
        if (footprint.createdBy.id === userId) {
            return true
        }
        const reactionsByUser = reactions.filter(react => react.createdBy.id === userId)
        return reactionsByUser.length > 0
    }

    createFootprintReaction = async ({ id, message, uid }: { id: number | string, message: string, uid: string }) => {
        const em = this.orm.forkEm()
        const [ footprint, user ] = await Promise.all([
            this.findFootprintById(id),
            this.userRepository.getUserByUid(uid),
        ])
        const reaction = new FootprintReaction(user, message, footprint)
        const reactions: FootprintReaction[] = await em.find('FootprintReaction', { footprint: { id } } as any)
        await em.persistAndFlush(reaction)
        let hasUserReactedToOrCreatedFootprint = false
        if (reactions) {
            hasUserReactedToOrCreatedFootprint = await this
                .hasUserReactedToOrCreatedFootprint(reactions, footprint, user.id)
        }
        if (hasUserReactedToOrCreatedFootprint) {
            return {
                reaction,
            }
        }
        const userWithUpdatedPoints = await this.userRepository.addPoints(uid, Points.FOOTPRINT_REACTION)
        return {
            reaction,
            points: Points.FOOTPRINT_REACTION,
            userPoints: userWithUpdatedPoints.points,
        }
    }

    deleteFootprint = async ({ id, uid }: { id: number | string, uid: string }) => {
        const em = this.orm.forkEm()
        const footprint = await this.findFootprintById(id)
        if (footprint.createdBy.uid !== uid) {
            throw new ForbiddenError()
        }
        const reactions = await em.find(
            'FootprintReaction',
            { footprint },
        )
        em.remove(reactions)
        return Promise.all([
            this.deletionService.deleteFilesOfOneFootprint(footprint.audioURL, footprint.imageURL),
            em.removeAndFlush(footprint),
        ])
    }

    deleteFootprintReaction = async ({ id, uid }: { id: number | string, uid: string }) => {
        const em = this.orm.forkEm()
        const reaction: FootprintReaction = await em.findOneOrFail(
            'FootprintReaction',
            { id } as any,
            {
                populate: ['createdBy'],
                failHandler: () => { throw new NotFoundError() },
            } as any,
        )
        if (reaction.createdBy.uid !== uid) {
            throw new ForbiddenError()
        }
        return em.removeAndFlush(reaction)
    }

    getAllFootprints = async () => {
        const em = this.orm.forkEm()
        return em.getRepository('Footprint').findAll({ populate: ['createdBy'] } as any)
    }

    getFootprintsOfSpecificUser = async (fc: string) => {
        const em = this.orm.forkEm()
        const user = await this.userRepository.getUserByFriendsCode(fc)
        return em.find(
            'Footprint',
            { createdBy: user } as any,
            { populate: ['createdBy'] } as any,
        )
    }

    getFootprintsOfFriendsAndUser = async (uid: string) => {
        const em = this.orm.forkEm()
        const user = await this.userRepository.getUserByUid(uid)
        const friendships = await this.friendshipRepository.getFriendshipsWithSpecifiedOptions(
            user,
            { status: FriendshipStatus.ACCEPTED },
            { fields: [{ invitor: ['id'] }, { invitee: ['id'] }] },
        )
        const friends = friendships.map(
            friendship => (friendship.invitor.id === user.id ? friendship.invitee.id : friendship.invitor.id),
        )
        const footprints: Footprint[] = await em.find(
            'Footprint',
            { createdBy: [ user, ...friends ] } as any,
            { populate: [ 'createdBy', 'users' ] } as any,
        )

        return footprints.map((footprint) => {
            const hasVisited = footprint.users.getIdentifiers('id').includes(user.id)
                || footprint.createdBy.id === user.id
            return { ...footprint, hasVisited }
        })
    }

    getFootprintById = async (uid: string, id: string | number) => {
        const em = this.orm.forkEm()
        const [ footprint, user ] = await Promise.all([
            this.findFootprintById(id),
            this.userRepository.getUserByUid(uid),
        ])
        if (!footprint.users.isInitialized()) {
            await footprint.users.init()
        }
        let myFootprint = true
        if (footprint.createdBy.id !== user.id) {
            myFootprint = false
            footprint.users.add(user)
        }
        if (myFootprint) {
            return {
                footprint,
            }
        }
        try {
            await em.persistAndFlush(footprint)
            const userWithUpdatedPoints = await this.userRepository.addPoints(uid, Points.FOOTPRINT_VIEWED)
            return {
                footprint: await this.findFootprintById(id),
                points: Points.FOOTPRINT_VIEWED,
                userPoints: userWithUpdatedPoints.points,
            }
        } catch {
            return {
                footprint,
            }
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
