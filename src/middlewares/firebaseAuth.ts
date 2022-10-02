/**
 * Authentication middleware using Firebase Auth
 *
 * @param firebaseAuth - Firebase Admin Auth Service
 * @param options - Options for the middleware
 * @param options.checkRevoked - Whether to check if the token has been revoked
 * @param options.attachUserTo - The name of the header attribute to attach the user to
 * @param options.errorJSON - The JSON to attach to the error response
 * @param options.errorMessage - The error message to send to the client
 * @returns The middleware function
 *
 * Will end the connection in this middleware if there is an error instead of relying on a 500 middleware
 * Request will end if JWT is invalid or if the JWT is missing
 * If authenticated, the decoded JWT will be attached to request for use downstream
 */
import { NextFunction, Request, Response } from 'express'
import { Auth } from 'firebase-admin/auth'
import { AUTH_HEADER_KEY, AUTH_HEADER_UID } from '../constants/index.js'

export const firebaseAuthMiddleware = (
    firebaseAuth: Auth,
    {
        checkRevoked = false,
        attachUserTo = AUTH_HEADER_UID,
        errorJSON = { ok: false },
        errorMessage = (errorObject: { message: any }) => errorObject.message || 'UNAUTHORIZED',
    } = {},
) => {
    if (!firebaseAuth) {
        throw new Error('Firebase Admin auth service MUST BE passed into setup!')
    }

    if (typeof errorMessage !== 'function') {
        throw new TypeError('Only Functions or Strings are allowed for errorMessage')
    }

    function authFailed(response: Response, status: number, error: string) {
        return response.status(status).json({
            error,
            ...errorJSON,
        })
    }

    return async function auth(request: Request, response: Response, next: NextFunction) {
        try {
            // eslint-disable-next-line security/detect-object-injection
            if (request.headers[AUTH_HEADER_KEY]) {
                // eslint-disable-next-line security/detect-object-injection
                let authHeader = request.headers[AUTH_HEADER_KEY]
                if (typeof authHeader !== 'string') {
                    // @ts-ignore
                    [authHeader] = authHeader
                }
                const decodedToken = await firebaseAuth.verifyIdToken(authHeader as string, checkRevoked)
                // eslint-disable-next-line security/detect-object-injection
                request.headers[attachUserTo] = decodedToken.uid
                return next()
            }
            return authFailed(response, 401, 'MISSING OR MALFORMED AUTH')
        } catch (error: any) {
            return authFailed(response, 403, errorMessage(error))
        }
    }
}
