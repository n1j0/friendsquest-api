import { Entity, ManyToOne, Property, types } from '@mikro-orm/core'
import { BaseEntity } from './baseEntity.js'
import { User } from './user.js'

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
    public imageURL?: string

    @Property()
    public audioURL?: string

    // TODO reactions

    constructor(title: string, createdBy: User, latitude: string, longitude: string) {
        super()
        this.title = title
        this.createdBy = createdBy
        this.latitude = latitude
        this.longitude = longitude
    }
}
