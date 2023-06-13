import { config } from 'dotenv'
import { startApplication } from '../../../src/helper/startApplication'
import { ORM } from '../../../src/orm'
import Application from '../../../src/application'

jest.mock('node-fetch', () => 'node-fetch')

jest.mock('express', () => jest.fn().mockReturnValue('express'))

jest.mock('../../../src/application', () => jest.fn().mockImplementation(() => ({
    init: jest.fn().mockReturnValue('application-init'),
})))

jest.mock('dotenv', () => ({
    config: jest.fn(),
}))

describe('startApplication', () => {
    beforeEach(() => {
        ORM.init = jest.fn().mockImplementation(() => 'orm-init')
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    afterAll(() => {
        jest.resetAllMocks()
    })

    it('should start application without error', () => {
        expect(async () => startApplication()).not.toThrow()
    })

    it('should start application with correct setup', async () => {
        const server = await startApplication()
        expect(config).toHaveBeenCalled()
        expect(ORM.init).toHaveBeenCalled()
        expect(Application).toHaveBeenCalledWith('orm-init', 'express')
        expect(server).toBe('application-init')
    })

    it('should console error', async () => {
        const error = new Error('test')
        ORM.init = jest.fn().mockImplementation(() => { throw error })
        jest.spyOn(console, 'error').mockImplementation(() => {})
        await startApplication()
        expect(console.error).toHaveBeenCalledWith(error)
    })
})
