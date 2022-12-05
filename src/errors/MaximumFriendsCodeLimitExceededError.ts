import {
    getReasonPhrase,
} from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class MaximumFriendsCodeLimitExceededError extends Error {
    static getErrorDocument(): ProblemDocument {
        return Mapper.mapError({
            detail: 'There are no more friends codes available.',
            status: 500,
            type: `http://tempuri.org/${getReasonPhrase(500)}`,
        })
    }
}
