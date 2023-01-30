import { mock } from 'jest-mock-extended'
import { Response } from 'express'
import { UserController } from '../../src/controller/userController'
import { UserRepositoryInterface } from '../../src/repositories/user/userRepositoryInterface'
import responseMock from '../test-helper/responseMock'
import ResponseSender from '../../src/helper/responseSender'
import { NotFoundError } from '../../src/errors/NotFoundError'
import { InternalServerError } from '../../src/errors/InternalServerError'
import { ValueAlreadyExistsError } from '../../src/errors/ValueAlreadyExistsError'
import { ForbiddenError } from '../../src/errors/ForbiddenError'
import { NegativeNumbersNotAllowedError } from '../../src/errors/NegativeNumbersNotAllowedError'
import { MaximumFriendsCodeLimitExceededError } from '../../src/errors/MaximumFriendsCodeLimitExceededError'

describe('UserController', () => {
    let userController: UserController
    let userRepository: UserRepositoryInterface
    let errorSpy: jest.SpyInstance
    let resultSpy: jest.SpyInstance
    let response: Response

    beforeEach(() => {
        response = responseMock
        userRepository = mock<UserRepositoryInterface>()
        userController = new UserController(userRepository)
        errorSpy = jest.spyOn(ResponseSender, 'error')
        resultSpy = jest.spyOn(ResponseSender, 'result')
    })

    describe('userNotFoundError', () => {
        it('sends an NotfoundError', () => {
            userController.userNotFoundError(response)
            expect(errorSpy).toHaveBeenCalledWith(response, NotFoundError.getErrorDocument('The user'))
        })
    })

    describe('getAllUsers', () => {
        it('returns all users', async () => {
            const users = 'users'
            // @ts-ignore
            userRepository.getAllUsers.mockResolvedValue(users)
            await userController.getAllUsers(response)
            expect(resultSpy).toHaveBeenCalledWith(response, 200, users)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            userRepository.getAllUsers.mockImplementation(() => {
                throw error
            })
            await userController.getAllUsers(response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('getUserById', () => {
        it('returns a user by id', async () => {
            const user = 'user'
            const id = 12
            // @ts-ignore
            userRepository.getUserById.mockResolvedValue(user)
            await userController.getUserById({ id }, response)
            expect(userRepository.getUserById).toHaveBeenCalledWith(id)
            expect(resultSpy).toHaveBeenCalledWith(response, 200, user)
        })

        it('sends an error if user not found', async () => {
            // @ts-ignore
            userRepository.getUserById.mockImplementation(() => {
                throw new NotFoundError()
            })
            jest.spyOn(userController, 'userNotFoundError')
            await userController.getUserById({ id: 1 }, response)
            expect(userController.userNotFoundError).toHaveBeenCalledWith(response)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            userRepository.getUserById.mockImplementation(() => {
                throw error
            })
            await userController.getUserById({ id: 1 }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('getUserByUid', () => {
        it('returns a user by uid', async () => {
            const user = 'user'
            const uid = 12
            // @ts-ignore
            userRepository.getUserByUid.mockResolvedValue(user)
            await userController.getUserByUid({ uid }, response)
            expect(userRepository.getUserByUid).toHaveBeenCalledWith(uid)
            expect(resultSpy).toHaveBeenCalledWith(response, 200, user)
        })

        it('sends an error if user not found', async () => {
            // @ts-ignore
            userRepository.getUserByUid.mockImplementation(() => {
                throw new NotFoundError()
            })
            jest.spyOn(userController, 'userNotFoundError')
            await userController.getUserByUid({ uid: 1 }, response)
            expect(userController.userNotFoundError).toHaveBeenCalledWith(response)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            userRepository.getUserByUid.mockImplementation(() => {
                throw error
            })
            await userController.getUserByUid({ uid: 1 }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('getUserByFriendsCode', () => {
        it('returns a user by friends code', async () => {
            const user = 'user'
            const fc = 'abcdef'
            // @ts-ignore
            userRepository.getUserByFriendsCode.mockResolvedValue(user)
            await userController.getUserByFriendsCode({ fc }, response)
            expect(userRepository.getUserByFriendsCode).toHaveBeenCalledWith(fc)
            expect(resultSpy).toHaveBeenCalledWith(response, 200, user)
        })

        it('sends an error if user not found', async () => {
            // @ts-ignore
            userRepository.getUserByFriendsCode.mockImplementation(() => {
                throw new NotFoundError()
            })
            jest.spyOn(userController, 'userNotFoundError')
            await userController.getUserByFriendsCode({ fc: 'abs' }, response)
            expect(userController.userNotFoundError).toHaveBeenCalledWith(response)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            userRepository.getUserByFriendsCode.mockImplementation(() => {
                throw error
            })
            await userController.getUserByFriendsCode({ fc: 'sam' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('createUser', () => {
        it('creates an user', async () => {
            const username = 'name'
            const email = 'mail'
            const uid = 'uid'
            const user = 'user'
            // @ts-ignore
            userRepository.checkUsernameAndMail.mockResolvedValue(true)
            // @ts-ignore
            userRepository.createUser.mockResolvedValue(user)
            await userController.createUser({ email, username, uid }, response)
            expect(userRepository.checkUsernameAndMail).toHaveBeenCalledWith(username, email)
            expect(userRepository.createUser).toHaveBeenCalledWith({ uid, username, email })
            expect(resultSpy).toHaveBeenCalledWith(response, 201, user)
        })

        it('sends an error if new user attributes already exist', async () => {
            const errorMessage = 'msg'
            // @ts-ignore
            userRepository.checkUsernameAndMail.mockImplementation(() => {
                throw new ValueAlreadyExistsError(errorMessage)
            })
            await userController.createUser({ email: '', username: '', uid: '' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, ValueAlreadyExistsError.getErrorDocument(errorMessage))
        })

        it('sends an error if access is forbidden', async () => {
            // @ts-ignore
            userRepository.checkUsernameAndMail.mockImplementation(() => {
                throw new ForbiddenError()
            })
            await userController.createUser({ email: '', username: '', uid: '' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, ForbiddenError.getErrorDocument())
        })

        it('sends an error if id for friends code generation is negative (as per db design this shouldn\'t happen)', async () => {
            const errorMessage = 'msg'
            // @ts-ignore
            userRepository.checkUsernameAndMail.mockImplementation(() => {
                throw new NegativeNumbersNotAllowedError(errorMessage)
            })
            await userController.createUser({ email: '', username: '', uid: '' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, NegativeNumbersNotAllowedError.getErrorDocument())
        })

        it('sends an error if maximum number of friends codes is reached', async () => {
            const errorMessage = 'msg'
            // @ts-ignore
            userRepository.checkUsernameAndMail.mockImplementation(() => {
                throw new MaximumFriendsCodeLimitExceededError(errorMessage)
            })
            await userController.createUser({ email: '', username: '', uid: '' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, MaximumFriendsCodeLimitExceededError.getErrorDocument())
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            userRepository.checkUsernameAndMail.mockImplementation(() => {
                throw error
            })
            await userController.createUser({ email: '', username: '', uid: '' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('updateUser', () => {
        it('updates user data (username, mail)', async () => {
            const username = 'name'
            const email = 'mail'
            const uid = 'uid'
            const user = {
                points: 30,
            }
            const points = 20
            // @ts-ignore
            userRepository.checkUsernameAndMail.mockResolvedValue(true)
            // @ts-ignore
            userRepository.updateUser.mockResolvedValue({ user, points })
            await userController.updateUser({ email, username, uid }, response)
            expect(userRepository.checkUsernameAndMail).toHaveBeenCalledWith(username, email)
            expect(userRepository.updateUser).toHaveBeenCalledWith(uid, { username, email })
            expect(resultSpy).toHaveBeenCalledWith(response, 200, user, { amount: points, total: user.points })
        })

        it('sends an error if user not found', async () => {
            // @ts-ignore
            userRepository.checkUsernameAndMail.mockImplementation(() => {
                throw new NotFoundError()
            })
            jest.spyOn(userController, 'userNotFoundError')
            await userController.updateUser({ email: '', username: '', uid: '' }, response)
            expect(userController.userNotFoundError).toHaveBeenCalledWith(response)
        })

        it('sends an error if new user attributes already exist', async () => {
            const errorMessage = 'msg'
            // @ts-ignore
            userRepository.checkUsernameAndMail.mockImplementation(() => {
                throw new ValueAlreadyExistsError(errorMessage)
            })
            await userController.updateUser({ email: '', username: '', uid: '' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, ValueAlreadyExistsError.getErrorDocument(errorMessage))
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            userRepository.checkUsernameAndMail.mockImplementation(() => {
                throw error
            })
            await userController.updateUser({ email: '', username: '', uid: '' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('deleteUser', () => {
        it('deletes an user', async () => {
            // @ts-ignore
            userRepository.deleteUser.mockResolvedValue(true)
            await userController.deleteUser({ uid: '1' }, response)
            expect(response.sendStatus).toHaveBeenCalledWith(204)
        })

        it('sends an error if user not found', async () => {
            // @ts-ignore
            userRepository.deleteUser.mockImplementation(() => {
                throw new NotFoundError()
            })
            jest.spyOn(userController, 'userNotFoundError')
            await userController.deleteUser({ uid: '1' }, response)
            expect(userController.userNotFoundError).toHaveBeenCalledWith(response)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            userRepository.deleteUser.mockImplementation(() => {
                throw error
            })
            await userController.deleteUser({ uid: '1' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })
})
