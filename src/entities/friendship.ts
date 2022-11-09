import { Entity, Enum, ManyToOne } from '@mikro-orm/core'
import { BaseEntity } from './baseEntity.js'
import { User } from './user.js'

// eslint-disable-next-line no-shadow
export enum FriendshipStatus {
    // eslint-disable-next-line no-unused-vars
    INVITED = 0,
    // eslint-disable-next-line no-unused-vars
    ACCEPTED = 1,
}

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
