import {
    StatusCodes,
    getReasonPhrase,
} from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class ForbiddenError extends Error {
    // eslint-disable-next-line no-unused-vars
    static getErrorDocument(ErrorString?: string): ProblemDocument {
        return Mapper.mapError({
            detail: `${(ErrorString)}`,
            status: StatusCodes.FORBIDDEN,
            type: `http://tempuri.org/${getReasonPhrase(403).replace(/\s+/g, '')}`,
        })
    }
}
