import * as dotenv from 'dotenv'

// TODO: how to test node entry point file?
describe.skip('index', () => {
    it('calls dotenv config', () => {
        const configSpy = jest.spyOn(dotenv, 'config')
        expect(configSpy).toHaveBeenCalled()
    })
})
