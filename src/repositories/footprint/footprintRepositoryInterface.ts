import { Footprint } from '../../entities/footprint.js'
import { FootprintReaction } from '../../entities/footprintReaction.js'
import { NewFootprint } from '../../types/footprint.js'

export interface FootprintRepositoryInterface {
    createFootprint({ title, description, latitude, longitude, files, uid }: NewFootprint)
        : Promise<{ footprint: Footprint, points: number, userPoints: number }>
    createFootprintReaction(
        { id, message, uid }: { id: number | string, message: string, uid: string },
    ): Promise<{ reaction: FootprintReaction, points?: number, userPoints?: number }>
    deleteFootprint({ id, uid }: { id: number | string, uid: string }): Promise<[void[], void]>
    deleteFootprintReaction({ id, uid }: { id: number | string, uid: string }): Promise<void>
    getAllFootprints(): Promise<object[]>
    getFootprintsOfSpecificFriendsCode(fc: string): Promise<object[]>
    getFootprintsOfFriendsAndUser(uid: string): Promise<object[]>
    getFootprintById(
        uid: string,
        id: number | string,
    ): Promise<{ footprint: Footprint, points?: number, userPoints?: number }>
    getFootprintReactions(id: number | string): Promise<any[]>
    findFootprintById(id: number | string): Promise<Footprint>
    hasUserReactedToOrCreatedFootprint(
        reactions: FootprintReaction[],
        footprint: Footprint,
        userId: number
    ): Promise<boolean>
    schnitzelJagd(fc: string, schnitzelUser?: string): Promise<any>
}
