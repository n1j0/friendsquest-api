// Stryker disable all

import { getReasonPhrase } from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class ValueAlreadyExistsError extends Error {
    static getErrorDocument(fieldName?: string): ProblemDocument {
        return Mapper.mapError({
            detail: `${(fieldName)} already taken.`,
            status: 400,
            type: `http://tempuri.org/${getReasonPhrase(400).replaceAll(/\s+/g, '')}`,
        })
    }
}
