import { Collection, Entity, ManyToOne, OneToMany, Property, types } from '@mikro-orm/core'
import { BaseEntity } from './baseEntity.js'
import { User } from './user.js'
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
    public viewCount: number = 0

    @Property()
    public imageURL!: string

    @Property()
    public audioURL!: string

    @OneToMany('FootprintReaction', 'footprint')
    public reactions: Collection<FootprintReaction> = new Collection<FootprintReaction>(this)

    constructor(title: string, createdBy: User, latitude: string, longitude: string, imageURL: string) {
        super()
        this.title = title
        this.createdBy = createdBy
        this.latitude = latitude
        this.longitude = longitude
        this.imageURL = imageURL
    }
}
