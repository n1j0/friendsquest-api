import { User } from '../../entities/user.js'

export interface UserRepositoryInterface {
    checkUsernameAndMail(username: string, email: string): Promise<void>
    getUserById(id: number | string): Promise<User>
    getUserByUid(uid: number | string): Promise<User>
    getUserByFriendsCode(friendsCode: number | string): Promise<User>
    getAllUsers(): Promise<object[]>
    createUser({ email, username, uid }: { email: string, username: string, uid: string }): Promise<User>
    updateUser(id: number | string,
               userData: { username: string, email: string }): Promise<{ user: User, points: number }>
    deleteUser(id: number | string): Promise<[void, void[]]>
    addPoints(uid: string, points: number): Promise<User>
}
