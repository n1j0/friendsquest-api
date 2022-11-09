import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from './baseEntity.js'

@Entity()
export class User extends BaseEntity {
    @Property({ unique: true })
    public username!: string

    @Property({ unique: true })
    public email!: string

    @Property({ unique: true })
    public uid!: string

    @Property()
    public imageURL?: string

    @Property({ unique: true, index: true })
    public friendsCode?: string

    constructor(email: string, uid: string, username: string) {
        super()
        this.email = email
        this.uid = uid
        this.username = username
    }
}
