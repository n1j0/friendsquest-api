import { Footprint } from '../../entities/footprint.js'
import { FootprintReaction } from '../../entities/footprintReaction.js'
import { NewFootprint } from '../../types/footprint.js'

export interface FootprintRepositoryInterface {
    createFootprint({ title, description, latitude, longitude, files, uid }: NewFootprint)
        : Promise<{ footprint: Footprint, points: number, userPoints: number }>
    createFootprintReaction(
        { id, message, uid }: { id: number | string, message: string, uid: string },
    ): Promise<{ reaction: FootprintReaction, points?: number, userPoints?: number }>
    getAllFootprints(): Promise<object[]>
    getFootprintsOfFriendsAndUser(uid: string): Promise<object[]>
    getFootprintById(
        uid: string,
        id: number | string,
    ): Promise<{ footprint: Footprint, points?: number, userPoints?: number }>
    getFootprintReactions(id: number | string): Promise<any[]>
}
