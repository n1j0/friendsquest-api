import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { UserService } from '../../../src/services/userService'
import { UserRepositoryInterface } from '../../../src/repositories/user/userRepositoryInterface'
import { UserPostgresRepository } from '../../../src/repositories/user/userPostgresRepository'
import { UserNotFoundError } from '../../../.out/src/errors/UserNotFoundError'

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
        // eslint-disable-next-line no-unused-vars
        let userRepository: UserRepositoryInterface
        let userPostgresRepository: UserRepositoryInterface
        let userService: UserService

        beforeEach(() => {
            orm = mock<ORM>()
            userRepository = mock<UserRepositoryInterface>()
            userPostgresRepository = new UserPostgresRepository(userService, orm)
        })

        describe.skip('getUserById', () => {
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

            it('throws NotFoundError when user not found', async () => {
                const findOneOrFail = jest.fn().mockRejectedValueOnce(new UserNotFoundError())
                // @ts-ignore
                orm.forkEm.mockImplementation(() => ({
                    findOneOrFail,
                }))

                const id = 1

                await expect(userPostgresRepository.getUserById(id)).rejects.toThrow(UserNotFoundError)
            })
        })

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
                { uid: '39FDDRsAsZNPmocG4ZIgcnwO5BF2' },
                {
                    failHandler: expect.any(Function),
                },
            )
            expect(user).toBe('user')
        })

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
    },
)
