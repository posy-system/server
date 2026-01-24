const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Posy API Documentation',
            version: '1.0.0',
            description: 'API documentation for Posy server',
        },
        servers: [
            {
                url: 'http://localhost:8000',
                description: 'Development server',
            },
        ],
        components: {
            schemas: {
                CreateUserRequest: {
                    type: 'object',
                    required: ['username', 'password', 'role'],
                    properties: {
                        username: {
                            type: 'string',
                            example: 'Admin',
                        },
                        password: {
                            type: 'string',
                            example: 'admin123',
                        },
                        role: {
                            type: 'string',
                            example: 'admin',
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: {
                            type: 'string',
                            example: 'Admin',
                        },
                        password: {
                            type: 'string',
                            example: 'admin123',
                        },
                    },
                },
                UserPublic: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '65f1c2a9b0b8a1f2c3d4e5f6' },
                        username: { type: 'string', example: 'Admin' },
                        role: { type: 'string', example: 'admin' },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Login successful' },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        user: { $ref: '#/components/schemas/UserPublic' },
                    },
                },
                SuccessMessage: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                        },
                    },
                },
                ErrorMessage: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    },
    apis: ['./routers/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
