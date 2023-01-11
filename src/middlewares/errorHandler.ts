import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import ErrorController from '../controller/errorController.js'

// eslint-disable-next-line consistent-return
export function errorHandler(request: Request, response: Response, next: NextFunction) {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        const error = errors.array()[0]
        const errorType = error.msg.type
        return ErrorController.sendError(response, errorType.getErrorDocument(error.msg.message))
    }
    next()
}
