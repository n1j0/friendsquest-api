// Stryker disable all

import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class ForbiddenError extends Error {
    static getErrorDocument(ErrorString?: string): ProblemDocument {
        return Mapper.mapError({
            detail: `${(ErrorString)}`,
            status: StatusCodes.FORBIDDEN,
            type: `http://tempuri.org/${getReasonPhrase(403).replaceAll(/\s+/g, '')}`,
        })
    }
}
