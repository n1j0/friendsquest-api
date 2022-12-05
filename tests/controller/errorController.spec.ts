import { mock } from 'jest-mock-extended'
import {
    ReasonPhrases,
} from 'http-status-codes'
import ErrorController from '../../src/controller/errorController'
import responseMock from '../helper/responseMock'
import { ProblemDocument } from '../../src/types/problemDocument'

const response = responseMock

describe('ErrorController', () => {
    it('has a static method to send an error', () => {
        const error = {} as ProblemDocument
        expect(ErrorController.sendError(response, error)).toBeDefined()
    })

    it('returns given error as json', () => {
        const error = mock<ProblemDocument>()
        ErrorController.sendError(response, error)
        expect(response.json).toHaveBeenCalledWith(error)
    })

    it('returns message from error as json', () => {
        const error: ProblemDocument = {
            title: ReasonPhrases.INTERNAL_SERVER_ERROR,
            status: 500,
        }
        ErrorController.sendError(response, error)
        expect(response.json).toHaveBeenCalledWith({ title: error.title, status: error.status })
    })
})
