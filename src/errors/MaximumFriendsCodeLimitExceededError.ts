export class MaximumFriendsCodeLimitExceededError extends Error {
    constructor(message: string = 'There are no more available friends codes') {
        super(message)
    }
}
