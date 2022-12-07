import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FriendsQuest',
            version: '0.0.1',
            // eslint-disable-next-line max-len
            description: 'Please pay attention to the first route. It is needed to get an idToken in order to test the other routes.',
        },
        servers: [
            {
                url: 'http://localhost:1234',
                description: 'Development server',
            },
            {
                url: 'https://friendsquest.projects.multimediatechnology.at',
                description: 'FH server',
            },
        ],
    },
    apis: [ './src/router/**/*.ts', './src/docs/**/*.yaml' ],
}

export const openapiSpecification = swaggerJsdoc(options)
