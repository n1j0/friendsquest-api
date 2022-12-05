import {
    StatusCodes,
    getReasonPhrase,
} from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'

export class NotFoundError extends Error {
    static getErrorDocument(parameter: string = 'The parameter'): Error.ProblemDocument {
        return Mapper.mapError({
            detail: `${parameter} you are looking for does not exist.`,
            status: StatusCodes.NOT_FOUND,
            type: `http://tempuri.org/${getReasonPhrase(404)}`,
        })
    }
}
