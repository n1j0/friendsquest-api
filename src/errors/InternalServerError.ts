import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class InternalServerError extends Error {
    static getErrorDocument(ErrorString?: string): ProblemDocument {
        return Mapper.mapError({
            detail: `${(ErrorString)}`,
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            type: `http://tempuri.org/${getReasonPhrase(500).replace(/\s+/g, '')}`,
        })
    }
}
