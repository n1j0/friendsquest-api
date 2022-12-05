import {
    getReasonPhrase,
} from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'

export class ValueAlreadyExistsError extends Error {
    static getErrorDocument(fieldName?: string): Error.ProblemDocument {
        return Mapper.mapError({
            detail: `${(fieldName)} already taken.`,
            status: 400,
            type: `http://tempuri.org/${getReasonPhrase(400)}`,
        })
    }
}
