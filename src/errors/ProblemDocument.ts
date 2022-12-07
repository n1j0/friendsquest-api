import {
    ReasonPhrases,
    getReasonPhrase,
} from 'http-status-codes'
import { ProblemDocument } from '../types/problemDocument'

/* eslint-disable-next-line unicorn/no-static-only-class */
export class Mapper {
    static mapError(error: any): ProblemDocument {
        return {
            title: getReasonPhrase(error.status) || ReasonPhrases.INTERNAL_SERVER_ERROR,
            status: error.status || 500,
            ...error,
        }
    }
}
