import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import { BaseEntity } from './baseEntity.js'
import { User } from './user.js'

@Entity()
export class Footprint extends BaseEntity {
    @Property()
    public title!: string

    @Property()
    public description?: string

    @ManyToOne()
    public user!: User

    @Property()
    public latitude!: number

    @Property()
    public longitude!: number

    @Property()
    public viewCount: number = 0

    @Property()
    public reactionsCount: number = 0

    @Property()
    public imageURL?: string

    @Property()
    public audioURL?: string

    // TODO reactions

    constructor(title: string, user: User, latitude: number, longitude: number) {
        super()
        this.title = title
        this.user = user
        this.latitude = latitude
        this.longitude = longitude
    }
}
