import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from './baseEntity.js'

@Entity()
export class User extends BaseEntity {
    @Property()
    public firstName?: string

    @Property()
    public lastName?: string

    @Property({ unique: true })
    public username?: string

    @Property({ unique: true })
    public email!: string

    @Property({ unique: true })
    public uid!: string

    @Property()
    public emailVerified: boolean = false

    @Property()
    public birthday?: Date

    @Property()
    public termsAccepted: boolean = false

    @Property()
    public accountActivated: boolean = false

    @Property()
    public homeland?: string

    @Property()
    public imageURL?: string

    constructor(email: string, uid: string) {
        super()
        this.email = email
        this.uid = uid
    }
}
