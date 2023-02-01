import { mock } from 'jest-mock-extended'
import { Response } from 'express'
import { FriendshipController } from '../../src/controller/friendshipController'
import { FriendshipRepositoryInterface } from '../../src/repositories/friendship/friendshipRepositoryInterface'
import { UserRepositoryInterface } from '../../src/repositories/user/userRepositoryInterface'
import responseMock from '../test-helper/responseMock'
import ResponseSender from '../../src/helper/responseSender'
import { NotFoundError } from '../../src/errors/NotFoundError'
import { InternalServerError } from '../../src/errors/InternalServerError'
import { ForbiddenError } from '../../src/errors/ForbiddenError'
import { FriendshipAlreadyExistsError } from '../../src/errors/FriendshipAlreadyExistsError'

describe('FriendshipController', () => {
    let friendshipController: FriendshipController
    let friendshipRepository: FriendshipRepositoryInterface
    let userRepository: UserRepositoryInterface
    let errorSpy: jest.SpyInstance
    let resultSpy: jest.SpyInstance
    let response: Response

    beforeEach(() => {
        response = responseMock
        friendshipRepository = mock<FriendshipRepositoryInterface>()
        userRepository = mock<UserRepositoryInterface>()
        friendshipController = new FriendshipController(friendshipRepository, userRepository)
        errorSpy = jest.spyOn(ResponseSender, 'error')
        resultSpy = jest.spyOn(ResponseSender, 'result')
    })

    describe('NotFoundError', () => {
        it('sends NotFoundError if user not found', () => {
            friendshipController.userNotFoundError(response)
            expect(errorSpy).toHaveBeenCalledWith(response, NotFoundError.getErrorDocument('The user'))
        })

        it('sends NotFoundError if friendship not found', () => {
            friendshipController.friendshipNotFoundError(response)
            expect(errorSpy).toHaveBeenCalledWith(response, NotFoundError.getErrorDocument('The friendship'))
        })
    })

    describe('getFriendshipsByUid', () => {
        it('return a list of friendships by user id', async () => {
            const userId = '1'
            const friendships = [{ id: 1 }]
            // @ts-ignore
            friendshipRepository.getFriendshipsByUid.mockResolvedValue(friendships)
            await friendshipController.getFriendshipsByUid({ userId }, response)
            expect(friendshipRepository.getFriendshipsByUid).toHaveBeenCalledWith(userId)
            expect(resultSpy).toHaveBeenCalledWith(response, 200, friendships)
        })

        it('sends NotFoundError if user not found', async () => {
            // @ts-ignore
            friendshipRepository.getFriendshipsByUid.mockImplementation(() => {
                throw new NotFoundError()
            })
            const userId = '1'
            jest.spyOn(friendshipController, 'userNotFoundError')
            await friendshipController.getFriendshipsByUid({ userId }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, NotFoundError.getErrorDocument('The friendship'))
        })

        it('sends InternalServerError if an error occurs', async () => {
            const error = new Error('error')
            // @ts-ignore
            friendshipRepository.getFriendshipsByUid.mockImplementation(() => {
                throw error
            })
            await friendshipController.getFriendshipsByUid({ userId: '1' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('createFriendship', () => {
        it('creates a friendship', async () => {
            const promiseSpy = jest.spyOn(Promise, 'all')
            const uid = '1'
            const friendsCode = 'friendsCode'
            const friendsCodeUpperCase = 'FRIENDSCODE'
            const invitor = {
                id: 1,
                uid,
                friendsCode,
            }
            const invitee = {
                id: 2,
                uid: '2',
                friendsCode: friendsCodeUpperCase,
            }
            const friendship = {
                id: 1,
                createdAt: '',
                updatedAt: '',
                invitor: {
                    id: invitor.id,
                },
                invitee: {
                    id: invitee.id,
                },
                status: 'accepted',
            }

            const friendshipWithFriendData = {
                id: 1,
                createdAt: '',
                updatedAt: '',
                invitor: invitor.id,
                invitee: invitee.id,
                status: 'accepted',
                friend: {
                    ...invitee,
                },
            }

            // @ts-ignore
            userRepository.getUserByUid.mockResolvedValue(invitor)
            // @ts-ignore
            userRepository.getUserByFriendsCode.mockResolvedValue(invitee)
            // @ts-ignore
            friendshipRepository.checkForExistingFriendship.mockResolvedValue(true)
            // @ts-ignore
            friendshipRepository.createFriendship.mockResolvedValue(friendship)

            await friendshipController.createFriendship({ friendsCode, uid }, response)

            expect(promiseSpy).toHaveBeenCalled()
            expect(userRepository.getUserByUid).toHaveBeenCalledWith(invitor.uid)
            expect(userRepository.getUserByFriendsCode).toHaveBeenCalledWith(friendsCodeUpperCase)
            expect(friendshipRepository.checkForExistingFriendship).toHaveBeenCalledWith(invitor, invitee)
            expect(friendshipRepository.createFriendship).toHaveBeenCalledWith(invitor, invitee)
            expect(resultSpy).toHaveBeenCalledWith(response, 200, friendshipWithFriendData)
        })

        it('sends ForbiddenError if user tries to add himself', async () => {
            const uid = '1'
            const friendsCode = 'friendsCode'
            const invitor = {
                id: 1,
                uid,
                friendsCode,
            }

            // @ts-ignore
            userRepository.getUserByUid.mockResolvedValue(invitor)
            // @ts-ignore
            userRepository.getUserByFriendsCode.mockResolvedValue(invitor)
            // @ts-ignore
            friendshipRepository.checkForExistingFriendship.mockImplementation(() => {
                throw new ForbiddenError()
            })

            await friendshipController.createFriendship({ friendsCode, uid }, response)

            expect(errorSpy).toHaveBeenCalledWith(
                response,
                ForbiddenError.getErrorDocument('You can not add yourself.'),
            )
        })

        it('sends ForbiddenError if Friendship already exists', async () => {
            const errorMessage = 'Friendship already exists.'
            const friendsCode = 'FRIENDSCODE'
            const uid = '1'
            const invitor = {
                id: 1,
                uid,
                friendsCode: 'FRIENDSCODE2',
            }
            const invitee = {
                id: 2,
                uid: '2',
                friendsCode,
            }

            // @ts-ignore
            userRepository.getUserByUid.mockResolvedValue(invitor)
            // @ts-ignore
            userRepository.getUserByFriendsCode.mockResolvedValue(invitee)
            // @ts-ignore
            friendshipRepository.checkForExistingFriendship.mockImplementation(() => {
                throw new FriendshipAlreadyExistsError(errorMessage)
            })

            await friendshipController.createFriendship({ friendsCode, uid }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, ForbiddenError.getErrorDocument(errorMessage))
        })

        it('sends InternalServerError if an error occurs in checkForExistingFriendship', async () => {
            const errorMessage = 'error'
            const friendsCode = 'FRIENDSCODE'
            const uid = '1'
            const invitor = {
                id: 1,
                uid,
                friendsCode: 'FRIENDSCODE2',
            }
            const invitee = {
                id: 2,
                uid: '2',
                friendsCode,
            }

            // @ts-ignore
            userRepository.getUserByUid.mockResolvedValue(invitor)
            // @ts-ignore
            userRepository.getUserByFriendsCode.mockResolvedValue(invitee)
            // @ts-ignore
            friendshipRepository.checkForExistingFriendship.mockImplementation(() => {
                throw new InternalServerError(errorMessage)
            })

            await friendshipController.createFriendship({ friendsCode, uid }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(errorMessage))
        })

        it('sends userNotFound if user does not exist', async () => {
            const friendsCode = 'FRIENDSCODE'
            const uid = '1'
            const invitor = {
                id: 1,
                uid,
                friendsCode: 'FRIENDSCODE2',
            }

            // @ts-ignore
            userRepository.getUserByUid.mockResolvedValue(invitor)
            // @ts-ignore
            userRepository.getUserByFriendsCode.mockImplementation(() => {
                throw new NotFoundError()
            })

            await friendshipController.createFriendship({ friendsCode, uid }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, NotFoundError.getErrorDocument('The user'))
        })

        it('sends InternalServerError if an error occurs in getUserByUid', async () => {
            const errorMessage = 'error'
            // @ts-ignore
            userRepository.getUserByUid.mockImplementation(() => {
                throw new InternalServerError(errorMessage)
            })
            await friendshipController.createFriendship({ friendsCode: 'friendsCode', uid: '1' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(errorMessage))
        })
    })

    describe('acceptFriendship', () => {
        it('accepts a friendship and returns it with points', async () => {
            const uid = '1'
            const id = 1
            const invitor = {
                uid: '2',
                points: 15,
            }
            const invitee = {
                uid,
                points: 10,
            }
            const points = 10
            const status = 'not-accepted'
            const friendship = {
                invitee,
                invitor,
                status,
            }

            // @ts-ignore
            friendshipRepository.getFriendshipById.mockResolvedValue(friendship)
            // @ts-ignore
            friendshipRepository.acceptFriendship.mockResolvedValue({ invitor, invitee, points })

            await friendshipController.acceptFriendship({ id, uid }, response)

            expect(friendshipRepository.getFriendshipById).toHaveBeenCalledWith(id)
            expect(friendshipRepository.acceptFriendship).toHaveBeenCalledWith(friendship)
            expect(resultSpy).toHaveBeenCalledWith(
                response,
                200,
                friendship,
                { amount: points, total: points },
            )
        })

        it('sends ForbiddenError if user is not the invitee', async () => {
            const uid = '1'
            const friendship = {
                invitee: {
                    uid: 'not-allowed',
                },
            }
            const errorMessage = 'You are not allowed to accept this friendship.'
            // @ts-ignore
            friendshipRepository.getFriendshipById.mockResolvedValue(friendship)

            await friendshipController.acceptFriendship({ id: '', uid }, response)
            expect(errorSpy).toHaveBeenCalledWith(
                response,
                ForbiddenError.getErrorDocument(errorMessage),
            )
        })

        it('sends ForbiddenError if friendship already accepted', async () => {
            const uid = '1'
            const status = 'accepted'
            const friendship = {
                invitee: {
                    uid,
                },
                status,
            }
            const errorMessage = 'Friendship already accepted.'
            // @ts-ignore
            friendshipRepository.getFriendshipById.mockResolvedValue(friendship)

            await friendshipController.acceptFriendship({ id: '', uid }, response)
            expect(errorSpy).toHaveBeenCalledWith(
                response,
                ForbiddenError.getErrorDocument(errorMessage),
            )
        })

        it('sends friendshipNotFound if friendship is not found', async () => {
            const uid = '1'
            const errorMessage = 'The friendship'
            // @ts-ignore
            friendshipRepository.getFriendshipById.mockImplementation(() => {
                throw new NotFoundError()
            })

            await friendshipController.acceptFriendship({ id: '', uid }, response)
            expect(errorSpy).toHaveBeenCalledWith(
                response,
                NotFoundError.getErrorDocument(errorMessage),
            )
        })

        it('sends InternalServerError if an error in getFriendshipById occurs', async () => {
            const error = new Error('error')
            // @ts-ignore
            friendshipRepository.getFriendshipById.mockImplementation(() => {
                throw error
            })
            await friendshipController.acceptFriendship({ id: '', uid: '' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })

        it('sends InternalServerError if an error in acceptFriendship occurs', async () => {
            const error = new Error('error')
            const uid = '1'
            const id = 1
            const friendship = {
                invitee: {
                    uid,
                },
            }
            // @ts-ignore
            friendshipRepository.getFriendshipById.mockResolvedValue(friendship)
            // @ts-ignore
            friendshipRepository.acceptFriendship.mockImplementation(() => {
                throw error
            })
            await friendshipController.acceptFriendship({ id, uid }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('declineOrDeleteFriendship', () => {
        it('returns 204 if friendship is declined', async () => {
            const uid = '1'
            const id = 1
            const friendship = {
                invitee: {
                    uid,
                },
                invitor: {
                    uid,
                },
            }
            // @ts-ignore
            friendshipRepository.getFriendshipById.mockResolvedValue(friendship)
            // @ts-ignore
            friendshipRepository.declineOrDeleteExistingFriendship.mockResolvedValue(true)
            await friendshipController.declineOrDeleteFriendship({ id, uid }, response)
            expect(friendshipRepository.getFriendshipById).toHaveBeenCalledWith(id)
            expect(friendshipRepository.declineOrDeleteExistingFriendship).toHaveBeenCalledWith(friendship)
            expect(response.sendStatus).toHaveBeenCalledWith(204)
        })

        it('returns ForbiddenError if user is not invitee or invitee', async () => {
            const uid = '1'
            const id = 1
            const friendship = {
                invitee: {
                    uid: 'not-allowed',
                },
                invitor: {
                    uid: 'not-allowed',
                },
            }
            // @ts-ignore
            friendshipRepository.getFriendshipById.mockResolvedValue(friendship)
            await friendshipController.declineOrDeleteFriendship({ id, uid }, response)
            expect(errorSpy).toHaveBeenCalledWith(
                response,
                ForbiddenError.getErrorDocument('You are not allowed to decline or delete this friendship.'),
            )
        })

        it('returns FriendshipNotFoundError if an error occurs', async () => {
            const uid = '1'
            const id = 1
            const notFoundError = new NotFoundError('test')
            // @ts-ignore
            friendshipRepository.getFriendshipById.mockImplementation(() => {
                throw notFoundError
            })
            jest.spyOn(friendshipController, 'friendshipNotFoundError')
            await friendshipController.declineOrDeleteFriendship({ id, uid }, response)
            expect(friendshipController.friendshipNotFoundError).toHaveBeenCalledWith(response)
        })

        it('returns InternalServerError if an error occurs', async () => {
            const error = new Error('test')
            // @ts-ignore
            friendshipRepository.getFriendshipById.mockImplementation(() => {
                throw error
            })

            await friendshipController.declineOrDeleteFriendship({ id: '', uid: '' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })
})
