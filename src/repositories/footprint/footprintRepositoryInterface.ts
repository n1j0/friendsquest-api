import { Request } from 'express'
import { Footprint } from '../../entities/footprint.js'
import { FootprintReaction } from '../../entities/footprintReaction.js'

export interface FootprintRepositoryInterface {
    createFootprint(request: Request): Promise<Footprint>
    createFootprintReaction(request: Request, id: number | string, message: string): Promise<FootprintReaction>
    getAllFootprints(): Promise<object[]>
    getFootprintById(id: number | string): Promise<Footprint>
    getFootprintReactions(id: number | string): Promise<any[]>
}
