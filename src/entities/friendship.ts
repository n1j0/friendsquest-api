// Stryker disable all

import { Entity, Enum, ManyToOne } from '@mikro-orm/core'
import { BaseEntity } from './baseEntity.js'
import { User } from './user.js'
import { FriendshipStatus } from '../constants/index.js'

@Entity()
export class Friendship extends BaseEntity {
    @ManyToOne('User')
    public invitor!: User

    @ManyToOne('User')
    public invitee!: User

    @Enum(() => FriendshipStatus)
    public status?: FriendshipStatus

    constructor(invitor: User, invitee: User) {
        super()
        this.invitor = invitor
        this.invitee = invitee
        this.status = FriendshipStatus.INVITED
    }
}
