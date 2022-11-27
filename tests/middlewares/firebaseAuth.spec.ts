import { Auth } from 'firebase-admin/auth'
import { Request } from 'express'
import { firebaseAuthMiddleware } from '../../src/middlewares/firebaseAuth'
import responseMock from '../helper/responseMock'

const response = responseMock

describe('FirebaseAuth', () => {
    it('throws an error if firebaseAuth is not passed in', () => {
        expect(() => firebaseAuthMiddleware(undefined as unknown as Auth))
            .toThrow('Firebase Admin auth service MUST BE passed into setup!')
    })

    it('throws an error if errorMessage is not a function', () => {
        expect(() => firebaseAuthMiddleware(
            {} as unknown as Auth,
            { errorMessage: 'string' as unknown as () => string },
        ))
            .toThrow('Only Functions or Strings are allowed for errorMessage')
    })

    it('returns a function', () => {
        expect(firebaseAuthMiddleware({} as unknown as Auth)).toBeInstanceOf(Function)
    })

    it('throws an error if something goes wrong', async () => {
        const firebaseAuth = {
            verifyIdToken: jest.fn().mockImplementation(() => {
                throw new Error('error')
            }),
        }
        const middleware = firebaseAuthMiddleware(
            firebaseAuth as unknown as Auth,
            {
                authHeaderKey: 'test',
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
        const middleware = firebaseAuthMiddleware(
            {} as unknown as Auth,
            {
                authHeaderKey: 'foo',
            },
        )
        const request = {
            headers: {
                test: 'sample',
            },
        }
        await middleware(request as unknown as Request, response, jest.fn())
        expect(response.status).toHaveBeenCalledWith(401)
        expect(response.json).toHaveBeenCalledWith({
            error: 'MISSING OR MALFORMED AUTH',
            ok: false,
        })
    })

    it('returns next function if everything works', async () => {
        const firebaseAuth = {
            verifyIdToken: jest.fn().mockResolvedValue({
                uid: 'sample',
            }),
        }
        const middleware = firebaseAuthMiddleware(
            firebaseAuth as unknown as Auth,
            {
                authHeaderKey: 'test',
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

    it('sets uid in request header', async () => {
        const firebaseAuth = {
            verifyIdToken: jest.fn().mockResolvedValue({
                uid: 'myUid',
            }),
        }
        const middleware = firebaseAuthMiddleware(
            firebaseAuth as unknown as Auth,
            {
                attachUserTo: 'uid',
                authHeaderKey: 'test',
            },
        )
        const request = {
            headers: {
                test: 'sample',
            },
        }
        await middleware(request as unknown as Request, response, jest.fn())
        expect((request.headers as unknown as { uid: string }).uid).toBe('myUid')
    })

    it('sets fallback error message', async () => {
        const firebaseAuth = {
            verifyIdToken: jest.fn().mockImplementation(() => {
                // eslint-disable-next-line unicorn/error-message
                throw new Error()
            }),
        }
        const middleware = firebaseAuthMiddleware(
            firebaseAuth as unknown as Auth,
            {
                authHeaderKey: 'test',
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
