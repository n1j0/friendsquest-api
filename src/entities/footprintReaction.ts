// Stryker disable all

import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { BaseEntity } from './baseEntity.js'
import { User } from './user.js'
// eslint-disable-next-line import/no-cycle
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
