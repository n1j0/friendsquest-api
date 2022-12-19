import { wrap } from '@mikro-orm/core'
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
        const footprint = new Footprint(
            title,
            user,
            latitude,
            longitude,
            photoURL,
            audioURL,
        )
        if (description) {
            wrap(footprint).assign({ description })
        }
        await em.persistAndFlush(footprint)
        const userWithUpdatedPoints = await this.userRepository.addPoints(uid, Points.FOOTPRINT_CREATED)
        return {
            footprint,
            points: Points.FOOTPRINT_CREATED,
            userPoints: userWithUpdatedPoints.points,
        }
    }

    createFootprintReaction = async ({ id, message, uid }: { id: number | string, message: string, uid: string }) => {
        const em = this.orm.forkEm()
        const [ footprint, user ] = await Promise.all([
            this.findFootprintById(id),
            this.userRepository.getUserByUid(uid),
        ])
        const reaction = new FootprintReaction(user, message, footprint)
        await em.persistAndFlush(reaction)
        const userWithUpdatedPoints = await this.userRepository.addPoints(uid, Points.FOOTPRINT_REACTION)
        return {
            reaction,
            points: Points.FOOTPRINT_REACTION,
            userPoints: userWithUpdatedPoints.points,
        }
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
            { status: FriendshipStatus.ACCEPTED },
            { fields: [{ invitor: ['id'] }, { invitee: ['id'] }] },
        )
        const friends = friendships.map(
            friendship => (friendship.invitor.id === user.id ? friendship.invitee.id : friendship.invitor.id),
        )
        const footprints = await em.find(
            'Footprint',
            { createdBy: [ user, ...friends ] } as any,
            { populate: ['createdBy'] } as any,
        )

        return Promise.all(footprints.map(async (footprint) => {
            if (!footprint.users.isInitialized()) {
                await footprint.users.init()
            }
            const hasVisited = footprint.users.getIdentifiers('id').includes(user.id)
            return { ...footprint, hasVisited }
        }))
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
