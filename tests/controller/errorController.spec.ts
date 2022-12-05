import { mock } from 'jest-mock-extended'
import {
    ReasonPhrases,
} from 'http-status-codes'
import ErrorController from '../../src/controller/errorController'
import responseMock from '../helper/responseMock'

const response = responseMock

describe('ErrorController', () => {
    it('has a static method to send an error', () => {
        const error = {} as Error.ProblemDocument
        expect(ErrorController.sendError(response, error)).toBeDefined()
    })

    it('returns given error as json', () => {
        const error = mock<Error.ProblemDocument>()
        ErrorController.sendError(response, error)
        expect(response.json).toHaveBeenCalledWith(error)
    })

    it('returns message from error as json', () => {
        const error: Error.ProblemDocument = {
            title: ReasonPhrases.INTERNAL_SERVER_ERROR,
            status: 500,
        }
        ErrorController.sendError(response, error)
        expect(response.json).toHaveBeenCalledWith({ title: error.title, status: error.status })
    })
})
