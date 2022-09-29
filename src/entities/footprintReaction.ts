import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { BaseEntity } from './baseEntity.js'
import { User } from './user.js'
import { Footprint } from './footprint.js'

@Entity()
export class FootprintReaction extends BaseEntity {
    @ManyToOne()
    public createdBy!: User

    @Property()
    public message!: string

    @ManyToOne('Footprint')
    public footprint!: Footprint

    constructor(createdBy: User, message: string, footprint: Footprint) {
        super()
        this.createdBy = createdBy
        this.message = message
        this.footprint = footprint
    }
}
