import ErrorController from '../../src/controller/errorController'
import responseMock from '../helper/responseMock'

const response = responseMock

describe('ErrorController', () => {
    it('has a static method to send an error', () => {
        expect(ErrorController.sendError(response, 0, '')).toBeDefined()
    })

    it.each([
        [200],
        [400],
        [500],
    ])('sets different codes for response', (code: number) => {
        ErrorController.sendError(response, code, '')
        expect(response.status).toHaveBeenCalledWith(code)
    })

    it('returns given string message as json', () => {
        const message = 'hello'
        ErrorController.sendError(response, 204, message)
        expect(response.json).toHaveBeenCalledWith({ message })
    })

    it('returns message from error as json', () => {
        const error = {
            message: 'sample',
        }
        ErrorController.sendError(response, 204, error)
        expect(response.json).toHaveBeenCalledWith({ message: error.message })
    })
})
