import {
    getReasonPhrase,
} from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'

export class AttributeIsMissingError extends Error {
    static getErrorDocument(fieldName: string = 'A field'): Error.ProblemDocument {
        return Mapper.mapError({
            detail: `${(fieldName)} is missing.`,
            status: 400,
            type: `http://tempuri.org/${getReasonPhrase(400)}`,
        })
    }
}
