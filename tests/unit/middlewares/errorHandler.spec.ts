import { Response, Request } from 'express'
import responseMock from '../../test-helper/responseMock'
import { errorHandler } from '../../../src/middlewares/errorHandler'
import ResponseSender from '../../../src/helper/responseSender'

jest.mock('express-validator', () => ({
    validationResult: jest.fn().mockImplementation(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
    })),
}))

jest.mock('../../../src/helper/responseSender', () => ({
    error: jest.fn(),
}))

describe('ErrorHandler', () => {
    const request = {} as unknown as Request
    const next = jest.fn().mockReturnValue('next')
    let response: Response

    beforeEach(() => {
        jest.clearAllMocks()
        response = responseMock
    })

    it('returns next function if no validation errors detected', () => {
        expect(errorHandler(request, response, next)).toBe('next')
    })

    it('returns error because validation detected errors', () => {
        const message = 'hello'
        // eslint-disable-next-line global-require,unicorn/prefer-module
        const { validationResult } = require('express-validator')
        const getErrorDocument = jest.fn().mockReturnValue('getErrorDocument')
        const responseSenderErrorSpy = jest.spyOn(ResponseSender, 'error')
        validationResult.mockImplementation(() => ({
            isEmpty: jest.fn().mockReturnValue(false),
            array: jest.fn().mockReturnValue([{
                msg: {
                    type: {
                        getErrorDocument,
                    },
                    message,
                },
            }]),
        }))
        errorHandler(request, response, next)
        expect(responseSenderErrorSpy).toHaveBeenCalledWith(response, 'getErrorDocument')
        expect(getErrorDocument).toHaveBeenCalledWith(message)
    })
})
