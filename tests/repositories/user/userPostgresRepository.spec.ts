import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { UserService } from '../../../src/services/userService'
import { UserRepositoryInterface } from '../../../src/repositories/user/userRepositoryInterface'
import { UserPostgresRepository } from '../../../src/repositories/user/userPostgresRepository'
import { DeletionService } from '../../../src/services/deletionService'
import { User } from '../../../src/entities/user'
import { ValueAlreadyExistsError } from '../../../src/errors/ValueAlreadyExistsError'
import { NotFoundError } from '../../../src/errors/NotFoundError'
import { Footprint } from '../../../src/entities/footprint'

jest.mock('@mikro-orm/core', () => ({
    PrimaryKey: jest.fn(),
    Property: jest.fn(),
    Entity: jest.fn(),
    ManyToOne: jest.fn(),
    ManyToMany: jest.fn(),
    Enum: jest.fn(),
    types: {
        datetime: jest.fn(),
    },
}))

jest.mock('../../../src/entities/user.js')

describe(
    'UserPostgresRepository',
    () => {
        let orm: ORM
        let userPostgresRepository: UserRepositoryInterface
        let userService: UserService
        let deletionService: DeletionService

        beforeEach(() => {
            orm = mock<ORM>()
            userService = mock<UserService>()
            deletionService = mock<DeletionService>()
            userPostgresRepository = new UserPostgresRepository(userService, deletionService, orm)
        })

        it('returns all users', async () => {
            const findAll = jest.fn().mockReturnValue([])
            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                getRepository: () => ({
                    findAll,
                }),
            }))

            const users = await userPostgresRepository.getAllUsers()

            expect(orm.forkEm).toHaveBeenCalled()
            expect(findAll).toHaveBeenCalledWith()
            expect(users).toStrictEqual([])
        })

        describe('checkUsernameAndMail', () => {
            it.each([
                [ [''], [''] ],
                [ [], [''] ],
                [ [''], [] ],
                // eslint-disable-next-line max-len
            ])('throws a ValueAlreadyExistsError if username (%s) or email (%s) exists', async (usersByUsername, usersByMail) => {
                const find = jest.fn()
                    .mockResolvedValueOnce(usersByUsername)
                    .mockResolvedValueOnce(usersByMail)
                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    find,
                }))

                await expect(userPostgresRepository.checkUsernameAndMail('', ''))
                    .rejects.toThrow(ValueAlreadyExistsError)
            })

            it('does not throw an error if username and email is not taken', async () => {
                const username = 'username'
                const email = 'email'
                const promiseSpy = jest.spyOn(Promise, 'all')
                const find = jest.fn()
                    .mockResolvedValueOnce([])
                    .mockResolvedValueOnce([])
                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    find,
                }))

                await userPostgresRepository.checkUsernameAndMail(username, email)

                expect(orm.forkEm).toHaveBeenCalled()
                expect(promiseSpy).toHaveBeenCalled()
                expect(find).toHaveBeenNthCalledWith(1, 'User', { username })
                expect(find).toHaveBeenNthCalledWith(2, 'User', { email })
            })
        })

        describe('get user by id', () => {
            it('returns one user by id', async () => {
                const findOneOrFail = jest.fn().mockReturnValue('user')
                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    findOneOrFail,
                }))

                const id = 1
                const user = await userPostgresRepository.getUserById(id)

                expect(orm.forkEm).toHaveBeenCalled()
                expect(findOneOrFail).toHaveBeenCalledWith(
                    'User',
                    { id: 1 },
                    {
                        failHandler: expect.any(Function),
                    },
                )
                expect(user).toBe('user')
            })

            it('throws error when user is not found', async () => {
                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    findOneOrFail: (
                        entityName: any,
                        where: any,
                        { failHandler }:
                            {
                                failHandler: () => {}
                            },
                    ) => failHandler(),
                }))

                const id = 1

                await expect(userPostgresRepository.getUserById(id)).rejects.toThrow(NotFoundError)
            })
        })

        describe('get user by uid', () => {
            it('returns one user by uid', async () => {
                const findOneOrFail = jest.fn().mockReturnValue('user')
                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    findOneOrFail,
                }))

                const uid = '39FDDRsAsZNPmocG4ZIgcnwO5BF2'
                const user = await userPostgresRepository.getUserByUid(uid)

                expect(orm.forkEm).toHaveBeenCalled()
                expect(findOneOrFail).toHaveBeenCalledWith(
                    'User',
                    { uid },
                    {
                        failHandler: expect.any(Function),
                    },
                )
                expect(user).toBe('user')
            })

            it('throws error when user is not found', async () => {
                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    findOneOrFail: (
                        entityName: any,
                        where: any,
                        { failHandler }:
                            {
                                failHandler: () => {}
                            },
                    ) => failHandler(),
                }))

                const uid = '39FDDRsAsZNPmocG4ZIgcnwO5BF2'

                // await expect(userPostgresRepository.getUserByUid(uid)).rejects.toThrow(NotFoundError)
                await expect(() => userPostgresRepository.getUserByUid(uid)).rejects.toThrow(NotFoundError)
            })
        })

        describe('get user by friendsCode', () => {
            it('returns one user by friendsCode', async () => {
                const findOneOrFail = jest.fn().mockReturnValue('user')
                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    findOneOrFail,
                }))

                const friendsCode = '00001'
                const user = await userPostgresRepository.getUserByFriendsCode(friendsCode)

                expect(orm.forkEm).toHaveBeenCalled()
                expect(findOneOrFail).toHaveBeenCalledWith(
                    'User',
                    { friendsCode },
                    {
                        failHandler: expect.any(Function),
                    },
                )
                expect(user).toBe('user')
            })

            it('throws error when user is not found', async () => {
                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    findOneOrFail: (
                        entityName: any,
                        where: any,
                        { failHandler }:
                            {
                                failHandler: () => {}
                            },
                    ) => failHandler(),
                }))

                const friendsCode = '00001'

                await expect(userPostgresRepository.getUserByFriendsCode(friendsCode)).rejects.toThrow(NotFoundError)
            })
        })

        it('creates and returns a new user', async () => {
            const friendsCode = '00000'
            const uid = 'uid'
            const user = { id: 1 }
            const persistAndFlush = jest.fn().mockResolvedValue(true)
            const assign = jest.fn().mockReturnValue('user')
            const getUserByUidMock = jest.fn().mockResolvedValue(user)
            userService.numberToBase36String = jest.fn().mockReturnValue(friendsCode)
            userPostgresRepository.getUserByUid = getUserByUidMock
            // @ts-ignore
            User.mockReturnValue(user)

            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                persistAndFlush,
                assign,
            }))

            const email = 'email'
            const username = 'username'

            const exampleUser = await userPostgresRepository.createUser({ email, username, uid })

            expect(orm.forkEm).toHaveBeenCalled()
            expect(User).toHaveBeenCalledWith(email, uid, username)
            expect(persistAndFlush).toHaveBeenNthCalledWith(1, user)
            expect(getUserByUidMock).toHaveBeenCalledWith(uid)
            expect(userService.numberToBase36String).toHaveBeenCalledWith(0)
            expect(assign).toHaveBeenCalledWith(user, { friendsCode })
            expect(persistAndFlush).toHaveBeenNthCalledWith(2, 'user')
            expect(exampleUser).toBe('user')
        })

        it('updates and returns a user', async () => {
            const points = {
                PROFILE_EDITED: 50,
            }

            const user = {
                id: 1,
                uid: 1,
                username: 'username',
                email: 'email',
                points: 150,
            } as unknown as User

            const userUpdateData = {
                username: 'usernameNew',
                email: 'email',
            }

            const persistAndFlush = jest.fn().mockResolvedValue(true)
            const assign = jest.fn().mockReturnValue('user')
            const getUserByUidMock = jest.fn().mockResolvedValue(user)
            userPostgresRepository.getUserByUid = getUserByUidMock

            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                persistAndFlush,
                assign,
            }))

            const exampleUser = await userPostgresRepository.updateUser(user.id, userUpdateData)

            expect(orm.forkEm).toHaveBeenCalled()
            expect(getUserByUidMock).toHaveBeenCalledWith(user.id)
            expect(assign).toHaveBeenCalledWith(
                user,
                { ...userUpdateData, points: user.points + points.PROFILE_EDITED },
            )
            expect(persistAndFlush).toHaveBeenCalledWith('user')
            expect(exampleUser).toEqual({ user: 'user', points: points.PROFILE_EDITED })
        })

        describe('deleteUser', () => {
            let promiseSpy: jest.SpyInstance
            let isInitialized: jest.Mock
            let init: jest.Mock
            let removeAllFootprints: jest.Mock
            let removeAllUsers: jest.Mock
            let persist: jest.Mock
            let remove: jest.Mock
            let flush: jest.Mock
            let deleteAllUserFilesMock: jest.Mock
            let deleteUserMock: jest.Mock
            let user: User
            let footprints: Footprint []
            let footprint: Footprint
            let find: jest.Mock
            let getUserByUidMock: jest.Mock

            beforeEach(() => {
                promiseSpy = jest.spyOn(Promise, 'all')
                isInitialized = jest.fn().mockReturnValue(true)
                init = jest.fn().mockReturnValue(true)
                removeAllFootprints = jest.fn()
                removeAllUsers = jest.fn()
                persist = jest.fn()
                remove = jest.fn()
                flush = jest.fn()

                deleteAllUserFilesMock = jest.fn()
                deletionService.deleteAllUserFiles = deleteAllUserFilesMock

                deleteUserMock = jest.fn().mockReturnValue('test')
                deletionService.deleteUser = deleteUserMock

                user = {
                    id: 1,
                    uid: 'abc',
                    footprints: {
                        isInitialized,
                        init,
                        removeAll: removeAllFootprints,
                    },
                } as unknown as User

                footprint = {
                    id: 1,
                    users:
                        {
                            id: 1,
                            removeAll: removeAllUsers,
                        },
                } as unknown as Footprint

                footprints = [ footprint, footprint ]

                find = jest.fn()
                    .mockReturnValueOnce(['friendships'])
                    .mockReturnValueOnce(footprints)
                    .mockReturnValueOnce(['footprintReactions'])

                getUserByUidMock = jest.fn().mockResolvedValue(user)

                userPostgresRepository.getUserByUid = getUserByUidMock

                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    isInitialized,
                    find,
                    persist,
                    flush,
                    remove,
                }))
            })

            it('deletes a user', async () => {
                const result = await userPostgresRepository.deleteUser(user.uid)

                expect(orm.forkEm).toHaveBeenCalled()
                expect(getUserByUidMock).toHaveBeenCalledWith(user.uid)
                expect(removeAllFootprints).toHaveBeenCalledTimes(1)
                expect(promiseSpy).toHaveBeenCalled()
                expect(find).toHaveBeenNthCalledWith(1, 'Friendship', { $or: [{ invitor: user }, { invitee: user }] })
                expect(find).toHaveBeenNthCalledWith(2, 'Footprint', { createdBy: user }, { populate: ['users'] })
                expect(find).toHaveBeenNthCalledWith(
                    3,
                    'FootprintReaction',
                    { $or: [{ createdBy: user }, { footprint: footprints }] },
                )
                expect(persist).toHaveBeenCalledWith(user)
                expect(removeAllUsers).toHaveBeenCalledTimes(2)
                expect(persist).toHaveBeenCalledWith(user)
                expect(remove).toHaveBeenNthCalledWith(1, ['friendships'])
                expect(remove).toHaveBeenNthCalledWith(2, ['footprintReactions'])
                expect(remove).toHaveBeenNthCalledWith(3, footprints)
                expect(remove).toHaveBeenNthCalledWith(4, user)
                expect(promiseSpy).toHaveBeenCalled()
                expect(flush).toHaveBeenCalled()
                expect(deleteAllUserFilesMock).toHaveBeenCalledWith(user.uid)
                expect(deleteUserMock).toHaveBeenCalledWith(user.uid)
                expect(result).toBe('test')
            })

            it('initializes footprints if not initialized', async () => {
                isInitialized.mockReturnValue(false)
                await userPostgresRepository.deleteUser(user.uid)

                expect(init).toHaveBeenCalled()
            })
        })

        describe('addPoints', () => {
            it('add points to user', async () => {
                const user = {
                    id: 1,
                    uid: 1,
                    points: 0,
                } as unknown as User

                const persistAndFlush = jest.fn().mockResolvedValue(true)
                const assign = jest.fn().mockReturnValue('user')
                const getUserByUidMock = jest.fn().mockResolvedValue(user)
                userPostgresRepository.getUserByUid = getUserByUidMock

                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    persistAndFlush,
                    assign,
                }))

                const points = 50
                const exampleUser = await userPostgresRepository.addPoints(user.uid, points)

                expect(orm.forkEm).toHaveBeenCalled()
                expect(getUserByUidMock).toHaveBeenCalledWith(user.uid)
                expect(assign).toHaveBeenCalledWith(user, { points: user.points + points })
                expect(persistAndFlush).toHaveBeenCalledWith('user')
                expect(exampleUser).toBe('user')
            })

            it('error when persistAndFlush fails', async () => {
                const user = {
                    id: 1,
                    uid: 1,
                    points: 0,
                } as unknown as User

                const persistAndFlush = jest.fn().mockRejectedValue('error')
                const assign = jest.fn().mockReturnValue('user')
                userPostgresRepository.getUserByUid = jest.fn().mockResolvedValue(user)

                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    persistAndFlush,
                    assign,
                }))

                const points = 50
                const exampleUser = await userPostgresRepository.addPoints(user.uid, points)

                await expect(persistAndFlush).rejects.toMatch('error')
                expect(exampleUser).toBe('user')
            })
        })
    },
)
