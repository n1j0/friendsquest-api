import { Response } from 'express'

const response = {} as unknown as Response

response.status = jest.fn().mockReturnValue(response)
response.json = jest.fn().mockReturnValue(response)

export default response
