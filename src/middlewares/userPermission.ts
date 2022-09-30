/**
 * Authorization middleware using Firebase Auth
 */
import { NextFunction, Request, Response } from 'express'
import { AUTH_HEADER_UID } from '../constants/index.js'

export const userPermissionMiddleware = (
    /* eslint-disable no-unused-vars */
    predicate: (
        uid: string,
        request: Request
    /* eslint-enable no-unused-vars */
    ) => Promise<boolean>,
    {
        attachUserTo = AUTH_HEADER_UID,
        errorJSON = { ok: false },
        errorMessage = (errorObject: { message: any }) => errorObject.message || 'UNAUTHORIZED',
    } = {},
) => {
    // Assume that it can only be a string or function
    if (typeof errorMessage !== 'function') {
        throw new TypeError('Only Functions or Strings are allowed for errorMessage')
    }

    function authFailed(response: Response, status: number, error: string) {
        return response.status(status).json({
            error,
            ...errorJSON,
        })
    }

    /**
     * Apply this middleware to protected routes that require authorization.
     * Business logics to handle authorization like 'user can only request own data' should be written in the predicate.
     */
    return async function auth(request: Request, response: Response, next: NextFunction) {
        try {
            if (request.headers[attachUserTo]) {
                let uid = request.headers[attachUserTo]
                if (uid && typeof uid !== 'string') {
                    [uid] = uid
                }
                if (uid && (await predicate(uid, request))) {
                    return next()
                }
            }

            return authFailed(response, 403, 'UNAUTHORIZED')
        } catch (error: any) {
            return authFailed(response, 403, errorMessage(error))
        }
    }
}
