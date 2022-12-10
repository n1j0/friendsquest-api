import { Response } from 'express'
import { Points } from '../types/points'

export default class ResponseController {
    public static sendResponse = (
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
}
