import { Request } from 'express'
import { userPermissionMiddleware } from '../../src/middlewares/userPermission'
import responseMock from '../helper/responseMock'

const response = responseMock

describe('UserPermission', () => {
    it('throws an error if errorMessage is not a function', () => {
        expect(() => userPermissionMiddleware(
            () => Promise.resolve(true),
            { errorMessage: 'string' as unknown as () => string },
        ))
            .toThrow('Only Functions or Strings are allowed for errorMessage')
    })

    it('returns a function', () => {
        expect(userPermissionMiddleware(() => Promise.resolve(true))).toBeInstanceOf(Function)
    })

    it('throws an error if something goes wrong', async () => {
        const middleware = userPermissionMiddleware(
            jest.fn().mockImplementation(() => { throw new Error('error') }),
            {
                uidHeader: 'test',
            },
        )
        const request = {
            headers: {
                test: 'sample',
            },
        }
        await middleware(request as unknown as Request, response, jest.fn())
        expect(response.status).toHaveBeenCalledWith(403)
        expect(response.json).toHaveBeenCalledWith({
            error: 'error',
            ok: false,
        })
    })

    it('throws an error if auth header is missing', async () => {
        const middleware = userPermissionMiddleware(jest.fn().mockResolvedValue(true))
        const request = {
            headers: {
                test: 'sample',
            },
        }
        await middleware(request as unknown as Request, response, jest.fn())
        expect(response.status).toHaveBeenCalledWith(403)
        expect(response.json).toHaveBeenCalledWith({
            error: 'UNAUTHORIZED',
            ok: false,
        })
    })

    it('throws an error if predicate fails', async () => {
        const middleware = userPermissionMiddleware(
            jest.fn().mockResolvedValue(false),
            {
                uidHeader: 'test',
            },
        )
        const request = {
            headers: {
                test: 'sample',
            },
        }
        await middleware(request as unknown as Request, response, jest.fn())
        expect(response.status).toHaveBeenCalledWith(403)
        expect(response.json).toHaveBeenCalledWith({
            error: 'UNAUTHORIZED',
            ok: false,
        })
    })

    it('returns next function if everything works', async () => {
        const middleware = userPermissionMiddleware(
            jest.fn().mockResolvedValue(true),
            {
                uidHeader: 'test',
            },
        )
        const request = {
            headers: {
                test: 'sample',
            },
        }
        const next = jest.fn()
        await middleware(request as unknown as Request, response, next)
        expect(next).toHaveBeenCalled()
    })

    it('sets fallback error message', async () => {
        const middleware = userPermissionMiddleware(
            // eslint-disable-next-line unicorn/error-message
            jest.fn().mockImplementation(() => { throw new Error() }),
            {
                uidHeader: 'test',
            },
        )
        const request = {
            headers: {
                test: 'sample',
            },
        }
        await middleware(request as unknown as Request, response, jest.fn())
        expect(response.json).toHaveBeenCalledWith({
            error: 'UNAUTHORIZED',
            ok: false,
        })
    })
})
