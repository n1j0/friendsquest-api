import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { UserService } from '../../../src/services/userService'
import { UserRepositoryInterface } from '../../../src/repositories/user/userRepositoryInterface'
import { UserPostgresRepository } from '../../../src/repositories/user/userPostgresRepository'
import { DeletionService } from '../../../src/services/deletionService'
import { User } from '../../../src/entities/user'
import { ValueAlreadyExistsError } from '../../../src/errors/ValueAlreadyExistsError'
import { NotFoundError } from '../../../src/errors/NotFoundError'

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

        it('checks if a username and email already exists', async () => {
            const find = jest.fn().mockResolvedValueOnce([{ id: 1, username: 'username', email: 'email' }])
            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                find,
            }))
            await expect(userPostgresRepository.checkUsernameAndMail(
                'username',
                'email',
            )).rejects.toThrow(ValueAlreadyExistsError)
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

            const user = {
                id: 1,
                uid: 1,
            } as unknown as User

            const persistAndFlush = jest.fn().mockResolvedValue(true)
            const assign = jest.fn().mockReturnValue('user')
            const getUserByUidMock = jest.fn().mockResolvedValue(user.uid)
            userService.numberToBase36String = jest.fn().mockReturnValue(friendsCode)
            userPostgresRepository.getUserByUid = getUserByUidMock

            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                persistAndFlush,
                assign,
            }))

            const exampleUser = await userPostgresRepository.createUser(user)

            expect(orm.forkEm).toHaveBeenCalled()
            expect(persistAndFlush).toHaveBeenNthCalledWith(1, user)
            expect(getUserByUidMock).toHaveBeenCalledWith(user.uid)
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

        it.skip('deletes a user', async () => {
            const isInitialized = jest.fn().mockReturnValue(true)
            const init = jest.fn().mockReturnValue(true)

            const user = {
                id: 1,
                uid: 1,
                footprints: {
                    isInitialized,
                    init,
                },
            } as unknown as User

            const persistAndFlush = jest.fn().mockResolvedValue(true)
            const getUserByUidMock = jest.fn().mockResolvedValue(user)

            userPostgresRepository.getUserByUid = getUserByUidMock

            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                persistAndFlush,
                isInitialized,
            }))

            await userPostgresRepository.deleteUser(user.id)

            expect(orm.forkEm).toHaveBeenCalled()
            expect(getUserByUidMock).toHaveBeenCalledWith(user.id)
            expect(persistAndFlush).toHaveBeenCalledWith(user)
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
