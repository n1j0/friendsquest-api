// Stryker disable all

import { getReasonPhrase } from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class NegativeNumbersNotAllowedError extends Error {
    static getErrorDocument(): ProblemDocument {
        return Mapper.mapError({
            detail: 'Negative numbers not allowed.',
            status: 400,
            type: `http://tempuri.org/${getReasonPhrase(400).replace(/\s+/g, '')}`,
        })
    }
}
