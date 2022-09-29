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
    public createdBy!: User

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

    constructor(title: string, createdBy: User, latitude: number, longitude: number) {
        super()
        this.title = title
        this.createdBy = createdBy
        this.latitude = latitude
        this.longitude = longitude
    }
}
