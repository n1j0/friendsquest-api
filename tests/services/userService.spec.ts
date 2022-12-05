import { UserService } from '../../src/services/userService'
import { NegativeNumbersNotAllowedError } from '../../src/errors/NegativeNumbersNotAllowedError'
import { MaximumFriendsCodeLimitExceededError } from '../../src/errors/MaximumFriendsCodeLimitExceededError'

describe('UserService', () => {
    let userService: UserService

    beforeEach(() => {
        userService = new UserService()
    })

    it.each([
        [ 0, '00000' ],
        [ 1, '00001' ],
        [ 35, '0000Z' ],
        [ 36, '00010' ],
        [ 60_466_175, 'ZZZZZ' ],
    ])(
        'returns positiv decimal number %i as 5-letter base 36 upper case string "%s"',
        (number: number, string: string) => {
            expect(userService.numberToBase36String(number)).toBe(string)
        },
    )

    it('returns error for negativ decimal numbers', () => {
        expect(() => userService.numberToBase36String(-1)).toThrow(NegativeNumbersNotAllowedError)
    })

    it('returns error if maximum number for 5-letters is exceeded', () => {
        expect(() => userService.numberToBase36String(60_466_176)).toThrow(MaximumFriendsCodeLimitExceededError)
    })
})
