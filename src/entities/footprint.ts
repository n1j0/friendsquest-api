// Stryker disable all

import { Collection, Entity, Formula, ManyToMany, ManyToOne, OneToMany, Property, types } from '@mikro-orm/core'
import { BaseEntity } from './baseEntity.js'
import { User } from './user.js'
// eslint-disable-next-line import/no-cycle
import { FootprintReaction } from './footprintReaction.js'

@Entity()
export class Footprint extends BaseEntity {
    @Property()
    public title!: string

    @Property()
    public description?: string

    @ManyToOne()
    public createdBy!: User

    @Property({ type: types.double })
    public latitude!: string

    @Property({ type: types.double })
    public longitude!: string

    @Property()
    public temperature: number | undefined

    @Formula(() => '(SELECT COUNT(*) FROM "user_footprints" WHERE footprint_id = id)')
    @Property()
    public viewCount?: number = 0

    @Property()
    public imageURL!: string

    @Property()
    public audioURL!: string

    @OneToMany('FootprintReaction', 'footprint')
    public reactions: Collection<FootprintReaction> = new Collection<FootprintReaction>(this)

    @ManyToMany('User', 'footprints')
    public users: Collection<User> = new Collection<User>(this)

    constructor(
        title: string,
        createdBy: User,
        latitude: string,
        longitude: string,
        imageURL: string,
        audioURL: string,
        temperature?: number,
    ) {
        super()
        this.title = title
        this.createdBy = createdBy
        this.latitude = latitude
        this.longitude = longitude
        this.imageURL = imageURL
        this.audioURL = audioURL
        this.temperature = temperature
    }
}
