import { Footprint } from '../../entities/footprint.js'
import { FootprintReaction } from '../../entities/footprintReaction.js'
import { NewFootprint } from '../../types/footprint.js'

export interface FootprintRepositoryInterface {
    createFootprint({ title, latitude, longitude, files, uid }: NewFootprint): Promise<Footprint>
    createFootprintReaction(
        { id, message, uid }: { id: number | string, message: string, uid: string },
    ): Promise<FootprintReaction>
    getAllFootprints(): Promise<object[]>
    getFootprintsOfFriendsAndUser(uid: string): Promise<object[]>
    getFootprintById(id: number | string): Promise<Footprint>
    getFootprintReactions(id: number | string): Promise<any[]>
}
