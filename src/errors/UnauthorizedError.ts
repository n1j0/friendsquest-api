import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class UnauthorizedError extends Error {
    // eslint-disable-next-line no-unused-vars
    static getErrorDocument(ErrorString: string = 'Unauthorized'): ProblemDocument {
        return Mapper.mapError({
            detail: `${(ErrorString)}`,
            status: StatusCodes.UNAUTHORIZED,
            type: `http://tempuri.org/${getReasonPhrase(401).replace(/\s+/g, '')}`,
        })
    }
}
