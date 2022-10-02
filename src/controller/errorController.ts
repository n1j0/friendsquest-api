import { Response } from 'express'

export default class ErrorController {
    public static sendError = (response: Response, code: number, error: string | any) => response
        .status(code).json({ message: error.message || error })
}
