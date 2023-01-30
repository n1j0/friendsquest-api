import { mock } from 'jest-mock-extended'
import { ORM } from '../../../src/orm'
import { UserService } from '../../../src/services/userService'
import { UserRepositoryInterface } from '../../../src/repositories/user/userRepositoryInterface'
import { UserPostgresRepository } from '../../../src/repositories/user/userPostgresRepository'
import { DeletionService } from '../../../src/services/deletionService'
import { User } from '../../../src/entities/user'

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

        it.skip('check username and email', async () => {
            const find = jest.fn().mockResolvedValueOnce([])
            // @ts-ignore
            orm.forkEm.mockImplementation(() => ({
                find,
            }))

            const user = new User('email', 'uid', 'username')
            const result = await userPostgresRepository.checkUsernameAndMail(user.username, user.email)

            expect(result).toStrictEqual([])
        })

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

        it('creates and returns a new user', async () => {
            const friendsCode = '00000'
            const user = { id: 1 }
            const persistAndFlush = jest.fn().mockResolvedValue(true)
            const assign = jest.fn().mockReturnValue('user')
            const getUserByUidMock = jest.fn().mockResolvedValue({ id: 1 })
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
            const uid = 'uid'

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
    },
)
