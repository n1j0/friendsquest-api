import {
    getReasonPhrase,
} from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'

export class NegativeNumbersNotAllowedError extends Error {
    static getErrorDocument(): Error.ProblemDocument {
        return Mapper.mapError({
            detail: 'Negative numbers not allowed.',
            status: 400,
            type: `http://tempuri.org/${getReasonPhrase(400)}`,
        })
    }
}
