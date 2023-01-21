import { mock } from 'jest-mock-extended'
import { ReasonPhrases } from 'http-status-codes'
import ResponseSender from '../../src/helper/responseSender'
import responseMock from '../test-helper/responseMock'
import { ProblemDocument } from '../../src/types/problemDocument'

const response = responseMock

describe('ResponseSender', () => {
    it('has a static method to send an error', () => {
        const error = {} as ProblemDocument
        expect(ResponseSender.error(response, error)).toBeDefined()
    })

    it('returns given error as json', () => {
        const error = mock<ProblemDocument>()
        ResponseSender.error(response, error)
        expect(response.json).toHaveBeenCalledWith(error)
    })

    it('returns message from error as json', () => {
        const error: ProblemDocument = {
            title: ReasonPhrases.INTERNAL_SERVER_ERROR,
            status: 500,
        }
        ResponseSender.error(response, error)
        expect(response.json).toHaveBeenCalledWith({ title: error.title, status: error.status })
    })
})
