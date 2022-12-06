import { NegativeNumbersNotAllowedError } from '../errors/NegativeNumbersNotAllowedError.js'
import { FRIENDS_CODE_LENGTH } from '../constants/index.js'
import { MaximumFriendsCodeLimitExceededError } from '../errors/MaximumFriendsCodeLimitExceededError.js'

// amount of characters (36) ^ length of friends code - 1 (0 counts as number)
const MAX_FRIENDS_CODES = 36 ** FRIENDS_CODE_LENGTH - 1

export class UserService {
    numberToBase36String = (number: number) => {
        if (number < 0) {
            throw new NegativeNumbersNotAllowedError()
        }

        if (number > MAX_FRIENDS_CODES) {
            throw new MaximumFriendsCodeLimitExceededError()
        }

        return number.toString(36).padStart(FRIENDS_CODE_LENGTH, '0').toUpperCase()
    }
}
