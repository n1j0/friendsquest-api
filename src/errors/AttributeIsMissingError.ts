// Stryker disable all

import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class AttributeIsMissingError extends Error {
    static getErrorDocument(message: string): ProblemDocument {
        return Mapper.mapError({
            detail: `${(message)}.`,
            status: StatusCodes.BAD_REQUEST,
            type: `http://tempuri.org/${getReasonPhrase(400).trim()}`,
        })
    }
}
