import { Response } from 'express'
import { ProblemDocument } from '../types/problemDocument'
import { Points } from '../types/points'

export default class ResponseSender {
    public static result = (
        response: Response,
        code: number,
        data: any,
        { amount, total }: Partial<Points> = {},
    ) => {
        let points = {}
        if (amount || total) {
            points = {
                amount: amount || 0,
                total: total || 0,
            }
        }
        return response.status(code).json({
            data,
            points,
        })
    }

    public static error = (response: Response, error: ProblemDocument) => {
        response.setHeader('Content-Type', 'application/problem+json')
        return response.status(error.status).json(error)
    }
}
