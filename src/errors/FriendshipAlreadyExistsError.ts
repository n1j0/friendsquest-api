// Stryker disable all

import { getReasonPhrase } from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'
import { ProblemDocument } from '../types/problemDocument'

export class FriendshipAlreadyExistsError extends Error {
    static getErrorDocument(): ProblemDocument {
        return Mapper.mapError({
            detail: 'The friendship already exists.',
            status: 400,
            type: `http://tempuri.org/${getReasonPhrase(400).replace(/\s+/g, '')}`,
        })
    }
}
