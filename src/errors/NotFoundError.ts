// Stryker disable all

import { getReasonPhrase, StatusCodes } from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class NotFoundError extends Error {
    static getErrorDocument(parameter: string = 'The parameter'): ProblemDocument {
        return Mapper.mapError({
            detail: `${parameter} you are looking for does not exist.`,
            status: StatusCodes.NOT_FOUND,
            type: `http://tempuri.org/${getReasonPhrase(404).replaceAll(/\s+/g, '')}`,
        })
    }
}
