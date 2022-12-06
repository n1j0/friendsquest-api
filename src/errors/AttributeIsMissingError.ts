import {
    getReasonPhrase,
} from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class AttributeIsMissingError extends Error {
    static getErrorDocument(fieldName: string = 'A field'): ProblemDocument {
        return Mapper.mapError({
            detail: `${(fieldName)} is missing.`,
            status: 400,
            type: `http://tempuri.org/${getReasonPhrase(400).trim()}`,
        })
    }
}
