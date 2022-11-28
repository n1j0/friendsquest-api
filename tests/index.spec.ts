import * as dotenv from 'dotenv'
import { mock } from 'jest-mock-extended'
import { ORM } from '../src/orm'
import Application from '../src/application'

// TODO: how to test node entry point file?
describe.skip('index', () => {
    const applicationMock = mock<Application>()
    const ormMock = mock<ORM>()
    let ormSpy = jest.spyOn(ORM, 'init').mockImplementation(() => Promise.resolve(ormMock))

    it('calls dotenv config', () => {
        const configSpy = jest.spyOn(dotenv, 'config')
        expect(configSpy).toHaveBeenCalled()
    })

    it('calls ORM.init', () => {
        expect(ormSpy).toHaveBeenCalled()
    })

    it('creates, connects and initializes Application', () => {
        expect(applicationMock).toHaveBeenCalledWith(ormMock)
        expect(applicationMock.connect).toHaveBeenCalled()
        expect(applicationMock.init).toHaveBeenCalled()
    })

    it('prints an error to the console', () => {
        const consoleSpy = jest.spyOn(console, 'error')
        const error = new Error('test')
        ormSpy = jest.spyOn(ORM, 'init').mockImplementation(() => { throw error })
        expect(consoleSpy).toHaveBeenCalledWith(error)
    })
})
