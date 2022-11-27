import { mock } from 'jest-mock-extended'
import { FootprintRepositoryInterface } from '../../src/repositories/footprint/footprintRepositoryInterface'
import FootprintController from '../../src/controller/footprintController'
import responseMock from '../helper/responseMock'
import ErrorController from '../../src/controller/errorController'

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

        it('sends an error if something wents wrong', async () => {
            const error = new Error('test')
            // @ts-ignore
            footprintRepository.getAllFootprints.mockImplementation(() => {
                throw error
            })
            await footprintController.getAllFootprints(response)
            expect(sendErrorSpy).toHaveBeenCalledWith(response, 500, error)
        })
    })
})
