import { mock } from 'jest-mock-extended'
import { Response } from 'express'
import { FootprintRepositoryInterface } from '../../../src/repositories/footprint/footprintRepositoryInterface'
import { FootprintController } from '../../../src/controller/footprintController'
import responseMock from '../../test-helper/responseMock'
import ResponseSender from '../../../src/helper/responseSender'
import { NotFoundError } from '../../../src/errors/NotFoundError'
import { InternalServerError } from '../../../src/errors/InternalServerError'
import { ForbiddenError } from '../../../src/errors/ForbiddenError'

describe('FootprintController', () => {
    let footprintController: FootprintController
    let footprintRepository: FootprintRepositoryInterface
    let errorSpy: jest.SpyInstance
    let resultSpy: jest.SpyInstance
    let response: Response

    beforeEach(() => {
        jest.clearAllMocks()
        response = responseMock
        footprintRepository = mock<FootprintRepositoryInterface>()
        footprintController = new FootprintController(footprintRepository)
        errorSpy = jest.spyOn(ResponseSender, 'error')
        resultSpy = jest.spyOn(ResponseSender, 'result')
    })

    describe('getAllFootprints', () => {
        it('returns all footprints', async () => {
            const result = 'test'
            // @ts-ignore
            footprintRepository.getAllFootprints.mockReturnValue(result)
            await footprintController.getAllFootprints(response)
            expect(footprintRepository.getAllFootprints).toHaveBeenCalled()
            expect(resultSpy).toHaveBeenCalledWith(response, 200, result)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.getAllFootprints.mockImplementation(() => {
                throw error
            })
            await footprintController.getAllFootprints(response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('getFootprintsOfFriendsAndUser', () => {
        it('returns footprints in response', async () => {
            const uid = 'uid'
            const footprints = 'footprints'
            // @ts-ignore
            footprintRepository.getFootprintsOfFriendsAndUser.mockReturnValue(footprints)
            await footprintController.getFootprintsOfFriendsAndUser({ uid }, response)
            expect(footprintRepository.getFootprintsOfFriendsAndUser).toHaveBeenCalledWith(uid)
            expect(resultSpy).toHaveBeenCalledWith(response, 200, footprints)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.getFootprintsOfFriendsAndUser.mockImplementation(() => {
                throw error
            })
            await footprintController.getFootprintsOfFriendsAndUser({ uid: 'a' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('getFootprintById', () => {
        it('returns footprint in response', async () => {
            const id = 1
            const uid = 'abc'
            const result = 'sample'
            const points = 200
            const userPoints = 500
            // @ts-ignore
            footprintRepository.getFootprintById.mockReturnValue({
                footprint: result,
                points,
                userPoints,
            })
            await footprintController.getFootprintById({ uid, id }, response)
            expect(footprintRepository.getFootprintById).toHaveBeenCalledWith(uid, id)
            expect(resultSpy).toHaveBeenCalledWith(response, 200, result, { amount: points, total: userPoints })
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.getFootprintById.mockImplementation(() => {
                throw error
            })
            await footprintController.getFootprintById({ uid: 'abc', id: 1 }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })

        it('sends an error if footprint not found', async () => {
            // @ts-ignore
            footprintRepository.getFootprintById.mockImplementation(() => {
                throw new NotFoundError()
            })
            await footprintController.getFootprintById({ uid: 'abc', id: 1 }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, NotFoundError.getErrorDocument('The footprint'))
        })
    })

    describe('getFootprintReactions', () => {
        it('returns footprint reactions in response', async () => {
            const id = 1
            const reaction = 'test'
            // @ts-ignore
            footprintRepository.getFootprintReactions.mockReturnValue(reaction)
            await footprintController.getFootprintReactions({ id }, response)
            expect(footprintRepository.getFootprintReactions).toHaveBeenCalledWith(id)
            expect(resultSpy).toHaveBeenCalledWith(response, 200, reaction)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.getFootprintReactions.mockImplementation(() => {
                throw error
            })
            await footprintController.getFootprintReactions({ id: 1 }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('createFootprintReaction', () => {
        it('creates reaction and returns footprint id with reaction in response', async () => {
            const id = 1
            const message = 'sample'
            const uid = 'abcdef'
            const footprintId = 123
            const reaction = {
                data: 'test',
                footprint: {
                    id: footprintId,
                },
            }
            const points = 10
            const userPoints = 345
            const result = { ...reaction, footprint: footprintId }
            // @ts-ignore
            footprintRepository.createFootprintReaction.mockReturnValue({ reaction, points, userPoints })
            await footprintController.createFootprintReaction({ id, message, uid }, response)
            expect(footprintRepository.createFootprintReaction).toHaveBeenCalledWith({ id, message, uid })
            expect(resultSpy).toHaveBeenCalledWith(response, 201, result, { amount: points, total: userPoints })
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.createFootprintReaction.mockImplementation(() => {
                throw error
            })
            await footprintController.createFootprintReaction({ id: 1, message: 'a', uid: 'abc' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('deleteFootprint', () => {
        it('deletes a footprint', async () => {
            const id = 12
            const uid = 'uid'
            // @ts-ignore
            footprintRepository.deleteFootprint.mockResolvedValue(true)
            await footprintController.deleteFootprint({ id, uid }, response)
            expect(footprintRepository.deleteFootprint).toHaveBeenCalledWith({ id, uid })
            expect(response.sendStatus).toHaveBeenCalledWith(204)
        })
        it('sends an NotFoundError if footprint is not found', async () => {
            const error = new NotFoundError('The footprint')
            // @ts-ignore
            footprintRepository.deleteFootprint.mockImplementation(() => {
                throw error
            })
            await footprintController.deleteFootprint({ id: 1, uid: 'uid' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, NotFoundError.getErrorDocument(error.message))
        })
        it('sends an ForbiddenError if user is not allowed to delete footprint', async () => {
            const error = new ForbiddenError('You cannot delete footprints of others')
            // @ts-ignore
            footprintRepository.deleteFootprint.mockImplementation(() => {
                throw error
            })
            await footprintController.deleteFootprint({ id: 1, uid: 'uid' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, ForbiddenError.getErrorDocument(error.message))
        })
        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.deleteFootprint.mockImplementation(() => {
                throw error
            })
            await footprintController.deleteFootprint({ id: 1, uid: 'uid' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('deleteFootprintReaction', () => {
        it('deletes a footprint reaction', async () => {
            const id = 12
            const uid = 'uid'
            // @ts-ignore
            footprintRepository.deleteFootprintReaction.mockResolvedValue(true)
            await footprintController.deleteFootprintReaction({ id, uid }, response)
            expect(footprintRepository.deleteFootprintReaction).toHaveBeenCalledWith({ id, uid })
            expect(response.sendStatus).toHaveBeenCalledWith(204)
        })
        it('sends an NotFoundError if reaction is not found', async () => {
            const error = new NotFoundError('The reaction')
            // @ts-ignore
            footprintRepository.deleteFootprintReaction.mockImplementation(() => {
                throw error
            })
            await footprintController.deleteFootprintReaction({ id: 1, uid: 'uid' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, NotFoundError.getErrorDocument(error.message))
        })
        it('sends an ForbiddenError if user is not allowed to delete reaction', async () => {
            const error = new ForbiddenError('You cannot delete reactions of others')
            // @ts-ignore
            footprintRepository.deleteFootprintReaction.mockImplementation(() => {
                throw error
            })
            await footprintController.deleteFootprintReaction({ id: 1, uid: 'uid' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, ForbiddenError.getErrorDocument(error.message))
        })
        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.deleteFootprintReaction.mockImplementation(() => {
                throw error
            })
            await footprintController.deleteFootprintReaction({ id: 1, uid: 'uid' }, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })

    describe('createFootprint', () => {
        const footprint = {
            uid: 'a',
            title: 'a',
            latitude: '1',
            longitude: '2',
            files: {
                image: [],
                audio: [],
            },
        }
        it('creates footprint and returns footprint with coordinates as numbers in response', async () => {
            const result = { ...footprint, latitude: 1, longitude: 2 }
            const points = 11
            const userPoints = 3546
            // @ts-ignore
            footprintRepository.createFootprint.mockReturnValue({ footprint, points, userPoints })
            await footprintController.createFootprint(footprint, response)
            expect(footprintRepository.createFootprint).toHaveBeenCalledWith(footprint)
            expect(resultSpy).toHaveBeenCalledWith(response, 201, result, { amount: points, total: userPoints })
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.createFootprint.mockImplementation(() => {
                throw error
            })
            await footprintController.createFootprint(footprint, response)
            expect(errorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })
    })
})
