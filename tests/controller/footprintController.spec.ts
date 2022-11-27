import { mock } from 'jest-mock-extended'
import { FootprintRepositoryInterface } from '../../src/repositories/footprint/footprintRepositoryInterface'
import FootprintController from '../../src/controller/footprintController'
import responseMock from '../helper/responseMock'
import ErrorController from '../../src/controller/errorController'
import { NewFootprint } from '../../src/types/footprint'

const sendErrorSpy = jest.spyOn(ErrorController, 'sendError')

const response = responseMock

describe('FootprintController', () => {
    let footprintController: FootprintController
    let footprintRepository: FootprintRepositoryInterface

    beforeEach(() => {
        footprintRepository = mock<FootprintRepositoryInterface>()
        footprintController = new FootprintController(footprintRepository)
    })

    describe('getAllFootprints', () => {
        it('returns all footprints', async () => {
            const result = 'test'
            // @ts-ignore
            footprintRepository.getAllFootprints.mockReturnValue(result)
            await footprintController.getAllFootprints(response)
            expect(footprintRepository.getAllFootprints).toHaveBeenCalled()
            expect(response.status).toHaveBeenCalledWith(200)
            expect(response.json).toHaveBeenCalledWith(result)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.getAllFootprints.mockImplementation(() => {
                throw error
            })
            await footprintController.getAllFootprints(response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 500, error)
        })
    })

    describe('getFootprintById', () => {
        it('returns footprint in response', async () => {
            const id = 1
            const result = 'sample'
            // @ts-ignore
            footprintRepository.getFootprintById.mockReturnValue(result)
            await footprintController.getFootprintById({ id }, response)
            expect(footprintRepository.getFootprintById).toHaveBeenCalledWith(1)
            expect(response.status).toHaveBeenCalledWith(200)
            expect(response.json).toHaveBeenCalledWith(result)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.getFootprintById.mockImplementation(() => {
                throw error
            })
            await footprintController.getFootprintById({ id: 1 }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 500, error)
        })

        it('sends an error if footprint not found', async () => {
            // @ts-ignore
            footprintRepository.getFootprintById.mockReturnValue()
            await footprintController.getFootprintById({ id: 1 }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 404, 'Footprint not found')
        })

        it('sends an error if id is missing', async () => {
            await footprintController.getFootprintById({ id: undefined } as unknown as { id: number }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 500, 'ID is missing')
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
            expect(response.status).toHaveBeenCalledWith(200)
            expect(response.json).toHaveBeenCalledWith(reaction)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.getFootprintReactions.mockImplementation(() => {
                throw error
            })
            await footprintController.getFootprintReactions({ id: 1 }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 500, error)
        })

        it('sends an error if id is missing', async () => {
            await footprintController.getFootprintReactions({ id: undefined } as unknown as { id: number }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 500, 'ID is missing')
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
            const result = { ...reaction, footprint: footprintId }
            // @ts-ignore
            footprintRepository.createFootprintReaction.mockReturnValue(reaction)
            await footprintController.createFootprintReaction({ id, message, uid }, response)
            expect(footprintRepository.createFootprintReaction).toHaveBeenCalledWith(id, message, uid)
            expect(response.status).toHaveBeenCalledWith(201)
            expect(response.json).toHaveBeenCalledWith(result)
        })

        it('trims the message of a new reaction', async () => {
            const id = 1
            const message = ' sample '
            const trimmedMessage = 'sample'
            const uid = 'abcdef'
            await footprintController.createFootprintReaction({ id, message, uid }, response)
            expect(footprintRepository.createFootprintReaction).toHaveBeenCalledWith(id, trimmedMessage, uid)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.createFootprintReaction.mockImplementation(() => {
                throw error
            })
            await footprintController.createFootprintReaction({ id: 1, message: 'a', uid: 'abc' }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 500, error)
        })

        it('sends an error if message is missing', async () => {
            await footprintController.createFootprintReaction({ id: 0, message: '', uid: '' }, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 500, 'Message is missing')
        })

        it('sends an error if id is missing', async () => {
            await footprintController.createFootprintReaction(
                { id: undefined, message: 'a', uid: '' } as unknown as { id: number, message: string, uid: string },
                response,
            )
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 500, 'ID is missing')
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
            // @ts-ignore
            footprintRepository.createFootprint.mockReturnValue(footprint)
            await footprintController.createFootprint(footprint, response)
            expect(footprintRepository.createFootprint).toHaveBeenCalledWith(footprint)
            expect(response.status).toHaveBeenCalledWith(201)
            expect(response.json).toHaveBeenCalledWith(result)
        })

        it('sends an error if something goes wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.createFootprint.mockImplementation(() => {
                throw error
            })
            await footprintController.createFootprint(footprint, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 500, error)
        })

        it.each([
            [{ uid: 'a', title: '', latitude: '1', longitude: '2', files: { image: [], audio: [] } }],
            [{ uid: 'a', title: 'b', latitude: '', longitude: '2', files: { image: [], audio: [] } }],
            [{ uid: 'a', title: 'b', latitude: '1', longitude: '', files: { image: [], audio: [] } }],
            [{ uid: 'a', title: 'b', latitude: '1', longitude: '2', files: undefined }],
        ])('sends an error if data is missing', async (newFootprint) => {
            await footprintController.createFootprint(newFootprint as unknown as NewFootprint, response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 400, 'Missing required fields')
        })
    })
})
