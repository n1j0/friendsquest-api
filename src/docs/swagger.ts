// Stryker disable all

import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FriendsQuest',
            version: '2.7.3',
            // eslint-disable-next-line max-len
            description: 'Please pay attention to the first route. It is needed to get an idToken in order to test the other routes.',
        },
        servers: [
            {
                url: 'http://localhost:1234',
                description: 'Local',
            },
            {
                url: 'https://friendsqueststaging.projects.multimediatechnology.at',
                description: 'Staging',
            },
            {
                url: 'https://friendsquest.projects.multimediatechnology.at',
                description: 'Production',
            },
        ],
        components: {
            securitySchemes: {
                CustomFirebaseAuth: {
                    type: 'apiKey',
                    name: 'x-auth',
                    in: 'header',
                    // eslint-disable-next-line max-len
                    description: 'We still use this as an auth token. But firebase doesn\'t return a valid bearer JWT. So we use this as a workaround.',
                },
            },
        },
        security: [{ CustomFirebaseAuth: [] }],
    },
    apis: [ './src/router/**/*.ts', './src/docs/**/*.yaml' ],
}

export const openapiSpecification = swaggerJsdoc(options)
