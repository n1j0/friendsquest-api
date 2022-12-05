import {
    ReasonPhrases,
    getReasonPhrase,
} from 'http-status-codes'

/* eslint-disable-next-line unicorn/no-static-only-class */
export class Mapper {
    static mapError(error: any): Error.ProblemDocument {
        return {
            title: getReasonPhrase(error.status) || ReasonPhrases.INTERNAL_SERVER_ERROR,
            status: error.status || 500,
            ...error,
        }
    }
}
