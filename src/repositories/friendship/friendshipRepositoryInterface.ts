import { Friendship } from '../../entities/friendship.js'
import { User } from '../../entities/user.js'

export interface FriendshipRepositoryInterface {
    getFriendships(userId: number | string): Promise<any>
    getFriendshipById(id: number | string): Promise<Friendship>
    checkForExistingFriendship(invitor: User, invitee: User): Promise<void>
    createFriendship(invitor: User, invitee: User): Promise<Friendship>
    acceptFriendship(friendship: Friendship): Promise<{ invitor: User, invitee: User }>
    declineOrDeleteExistingFriendship(friendship: Friendship): Promise<void>
}
