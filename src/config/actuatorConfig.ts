import { Request, Response } from 'express'

export const actuatorConfig = {
    customEndpoints: [
        {
            id: 'health-plain',
            controller: (_request: Request, response: Response) => {
                response.status(200).send('UP')
            },
        },
    ],
}
