import { User } from '../../entities/user.js'

export interface UserRepositoryInterface {
    checkUsernameAndMail(username: string, email: string): Promise<[number, number]>
    getUserById(id: number | string): Promise<User>
    getUserByUid(id: number | string): Promise<User>
    getUserByFriendsCode(friendsCode: number | string): Promise<User>
    getAllUsers(): Promise<object[]>
    createUser(user: User): Promise<User>
    updateUser(id: number | string, userData: any): Promise<User>
    deleteUser(id: number | string): Promise<void>
}
