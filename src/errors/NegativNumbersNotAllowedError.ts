export class NegativNumbersNotAllowedError extends Error {
    constructor(message: string = 'Negativ numbers not allowed') {
        super(message)
    }
}
