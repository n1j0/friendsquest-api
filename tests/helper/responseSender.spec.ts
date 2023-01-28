import { mock } from 'jest-mock-extended'
import { ReasonPhrases } from 'http-status-codes'
import ResponseSender from '../../src/helper/responseSender'
import responseMock from '../test-helper/responseMock'
import { ProblemDocument } from '../../src/types/problemDocument'

const response = responseMock

describe('ResponseSender', () => {
    describe('error', () => {
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

    describe('result', () => {
        it('has a static method to send a result', () => {
            expect(ResponseSender.result(response, 200, {})).toBeDefined()
        })

        it('returns given data as json (without points)', () => {
            const data = { foo: 'bar' }
            ResponseSender.result(response, 200, data)
            expect(response.json).toHaveBeenCalledWith({ data, points: {} })
        })

        it('returns given data as json (with points)', () => {
            const data = { foo: 'bar' }
            const points = { amount: 1, total: 2 }
            ResponseSender.result(response, 200, data, points)
            expect(response.json).toHaveBeenCalledWith({ data, points })
        })

        it('returns given data as json (with points, but without amount)', () => {
            const data = { foo: 'bar' }
            const points = { total: 2 }
            ResponseSender.result(response, 200, data, points)
            expect(response.json).toHaveBeenCalledWith({ data, points: { amount: 0, total: 2 } })
        })

        it('returns given data as json (with points, but without total)', () => {
            const data = { foo: 'bar' }
            const points = { amount: 1 }
            ResponseSender.result(response, 200, data, points)
            expect(response.json).toHaveBeenCalledWith({ data, points: { amount: 1, total: 0 } })
        })
    })
})
