import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FriendsQuest',
            version: '0.0.1',
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
    apis: ['./src/routes/**/*.ts'],
}

export const openapiSpecification = swaggerJsdoc(options)
