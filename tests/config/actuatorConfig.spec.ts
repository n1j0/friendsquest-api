import { Request } from 'express'
import { actuatorConfig } from '../../src/config/actuator.config'
import responseMock from '../test-helper/responseMock'

describe('actuatorConfig', () => {
    it('export custom health route with plain "UP" text', () => {
        const response = responseMock
        const config = actuatorConfig
        const { customEndpoints } = config

        expect(Array.isArray(customEndpoints)).toBe(true)
        expect(customEndpoints[0]).toStrictEqual({
            id: 'health-plain',
            controller: expect.any(Function),
        })

        customEndpoints[0].controller({} as unknown as Request, response)
        expect(response.status).toHaveBeenCalledWith(200)
        expect(response.send).toHaveBeenCalledWith('UP')
    })
})
