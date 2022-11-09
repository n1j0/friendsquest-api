import { Entity, Property, OneToMany, Collection } from '@mikro-orm/core'
import { BaseEntity } from './baseEntity.js'
import { Friendship } from './friendship.js'

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

    @OneToMany('Friendship', 'invitor')
    public friendships: Collection<Friendship> = new Collection<Friendship>(this)

    constructor(email: string, uid: string, username: string) {
        super()
        this.email = email
        this.uid = uid
        this.username = username
    }
}
