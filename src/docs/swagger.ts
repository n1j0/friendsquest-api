import swaggerJsdoc from 'swagger-jsdoc'

const options = {
    failOnErrors: true,
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FriendsQuest',
            version: '0.0.1',
        },
    },
    apis: ['./src/routes/*.ts'],
}

export const openapiSpecification = await swaggerJsdoc(options)
