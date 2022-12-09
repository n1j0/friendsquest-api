import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class InternalServerError extends Error {
    // eslint-disable-next-line no-unused-vars
    static getErrorDocument(ErrorString?: string): ProblemDocument {
        return Mapper.mapError({
            detail: `${(ErrorString)}`,
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            type: `http://tempuri.org/${getReasonPhrase(500).replace(/\s+/g, '')}`,
        })
    }
}
