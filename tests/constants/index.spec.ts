import * as constants from '../../src/constants'

describe('constants', () => {
    it('is defined', () => {
        expect(constants).toBeDefined()
    })

    it('exports auth header key', () => {
        expect(constants.AUTH_HEADER_KEY).toBeDefined()
    })

    it('exports auth header uid', () => {
        expect(constants.AUTH_HEADER_UID).toBeDefined()
    })

    it('exports enum FriendshipStatus', () => {
        expect(constants.FriendshipStatus).toBeDefined()
        expect(constants.FriendshipStatus.ACCEPTED).toBe('accepted')
        expect(constants.FriendshipStatus.INVITED).toBe('invited')
    })
})
