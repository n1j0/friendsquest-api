/**
 * Authorization middleware using Firebase Auth
 * @param predicate - The predicate function to check if the user is authorized
 * @param options - Options for the middleware
 * @param options.uidHeader - The name of the header attribute the user id is attached to
 * @param options.errorJSON - The JSON to attach to the error response
 * @param options.errorMessage - The error message to send to the client
 * @returns The middleware function
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
        uidHeader = AUTH_HEADER_UID,
        errorJSON = { ok: false },
        errorMessage = (errorObject: { message: any }) => errorObject.message || 'UNAUTHORIZED',
    } = {},
) => {
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
            // eslint-disable-next-line security/detect-object-injection
            if (request.headers[uidHeader]) {
                // eslint-disable-next-line security/detect-object-injection
                const uid = request.headers[uidHeader] as string
                if (await predicate(uid, request)) {
                    return next()
                }
            }

            return authFailed(response, 403, 'UNAUTHORIZED')
        } catch (error: any) {
            return authFailed(response, 403, errorMessage(error))
        }
    }
}
