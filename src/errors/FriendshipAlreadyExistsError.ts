import {
    getReasonPhrase,
} from 'http-status-codes'
import { Mapper } from './ProblemDocument.js'

export class FriendshipAlreadyExistsError extends Error {
    // eslint-disable-next-line no-unused-vars
    static getErrorDocument(): Error.ProblemDocument {
        return Mapper.mapError({
            detail: 'The friendship already exists.',
            status: 400,
            type: `http://tempuri.org/${getReasonPhrase(400)}`,
        })
    }
}
