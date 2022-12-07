import { Response } from 'express'

const response = {} as unknown as Response

response.setHeader = jest.fn().mockReturnValue(response)
response.status = jest.fn().mockReturnValue(response)
response.json = jest.fn().mockReturnValue(response)

export default response
