import { mock } from 'jest-mock-extended'
import { Response } from 'express'
import { FootprintRepositoryInterface } from '../../src/repositories/footprint/footprintRepositoryInterface'
import FootprintController from '../../src/controller/footprintController'
import responseMock from '../helper/responseMock'
import ErrorController from '../../src/controller/errorController'
import ResponseController from '../../src/controller/responseController'
import { NewFootprint } from '../../src/types/footprint'
import { NotFoundError } from '../../src/errors/NotFoundError'
import { InternalServerError } from '../../src/errors/InternalServerError'
import { AttributeIsMissingError } from '../../src/errors/AttributeIsMissingError'

describe('FootprintController', () => {
    let footprintController: FootprintController
    let footprintRepository: FootprintRepositoryInterface
    let sendErrorSpy: jest.SpyInstance
    let sendResponseSpy: jest.SpyInstance
    let response: Response

    beforeEach(() => {
        jest.clearAllMocks()
        response = responseMock
        footprintRepository = mock<FootprintRepositoryInterface>()
        footprintController = new FootprintController(footprintRepository)
        sendErrorSpy = jest.spyOn(ErrorController, 'sendError')
        sendResponseSpy = jest.spyOn(ResponseController, 'sendResponse')
    })

    describe('getAllFootprints', () => {
        it('returns all footprints', async () => {
            const result = 'test'
            // @ts-ignore
            footprintRepository.getAllFootprints.mockReturnValue(result)
            await footprintController.getAllFootprints(response)
            expect(footprintRepository.getAllFootprints).toHaveBeenCalled()
            expect(sendResponseSpy).toHaveBeenCalledWith(response, 200, result)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.getAllFootprints.mockImplementation(() => {
                throw error
            })
            await footprintController.getAllFootprints(response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
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
            expect(sendResponseSpy).toHaveBeenCalledWith(response, 200, result, { amount: points, total: userPoints })
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.getFootprintById.mockImplementation(() => {
                throw error
            })
            await footprintController.getFootprintById({ uid: 'abc', id: 1 }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })

        it('sends an error if footprint not found', async () => {
            // @ts-ignore
            footprintRepository.getFootprintById.mockImplementation(() => {
                throw new NotFoundError()
            })
            await footprintController.getFootprintById({ uid: 'abc', id: 1 }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, NotFoundError.getErrorDocument('The footprint'))
        })

        it('sends an error if id is missing', async () => {
            await footprintController.getFootprintById(
                { uid: 'abc', id: undefined } as unknown as { uid: string, id: number },
                response,
            )
            expect(sendErrorSpy).toHaveBeenCalledWith(response, AttributeIsMissingError.getErrorDocument('ID'))
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
            expect(sendResponseSpy).toHaveBeenCalledWith(response, 200, reaction)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.getFootprintReactions.mockImplementation(() => {
                throw error
            })
            await footprintController.getFootprintReactions({ id: 1 }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })

        it('sends an error if id is missing', async () => {
            await footprintController.getFootprintReactions({ id: undefined } as unknown as { id: number }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, AttributeIsMissingError.getErrorDocument('ID'))
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
            expect(sendResponseSpy).toHaveBeenCalledWith(response, 201, result, { amount: points, total: userPoints })
        })

        it('trims the message of a new reaction', async () => {
            const id = 1
            const message = ' sample '
            const trimmedMessage = 'sample'
            const uid = 'abcdef'
            await footprintController.createFootprintReaction({ id, message, uid }, response)
            expect(footprintRepository.createFootprintReaction).toHaveBeenCalledWith({
                id,
                message: trimmedMessage,
                uid,
            })
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.createFootprintReaction.mockImplementation(() => {
                throw error
            })
            await footprintController.createFootprintReaction({ id: 1, message: 'a', uid: 'abc' }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })

        it('sends an error if message is missing', async () => {
            await footprintController.createFootprintReaction({ id: 0, message: '', uid: '' }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, AttributeIsMissingError.getErrorDocument('Message'))
        })

        it('sends an error if id is missing', async () => {
            await footprintController.createFootprintReaction(
                { id: undefined, message: 'a', uid: '' } as unknown as { id: number, message: string, uid: string },
                response,
            )
            expect(sendErrorSpy).toHaveBeenCalledWith(response, AttributeIsMissingError.getErrorDocument('ID'))
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
            expect(sendResponseSpy).toHaveBeenCalledWith(response, 201, result, { amount: points, total: userPoints })
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.createFootprint.mockImplementation(() => {
                throw error
            })
            await footprintController.createFootprint(footprint, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, InternalServerError.getErrorDocument(error.message))
        })

        it.each([
            [{ uid: 'a', title: '', latitude: '1', longitude: '2', files: { image: [], audio: [] } }],
            [{ uid: 'a', title: 'b', latitude: '', longitude: '2', files: { image: [], audio: [] } }],
            [{ uid: 'a', title: 'b', latitude: '1', longitude: '', files: { image: [], audio: [] } }],
            [{ uid: 'a', title: 'b', latitude: '1', longitude: '2', files: undefined }],
        ])('sends an error if data is missing', async (newFootprint) => {
            await footprintController.createFootprint(newFootprint as unknown as NewFootprint, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(
                response,
                AttributeIsMissingError.getErrorDocument('Required fields'),
            )
        })
    })
})
