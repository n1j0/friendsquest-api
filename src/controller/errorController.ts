import { Response } from 'express'

export default class ErrorController {
    public static sendError = (response: Response, error: Error.ProblemDocument) => response
        .status(error.status).json(error)
}
