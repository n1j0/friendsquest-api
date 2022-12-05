import { Response } from 'express'
import { ProblemDocument } from '../types/problemDocument'

export default class ErrorController {
    public static sendError = (response: Response, error: ProblemDocument) => response
        .status(error.status).json(error)
}
