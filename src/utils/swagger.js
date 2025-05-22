const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('../config/config');

const router = express.Router();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: '7irafie API documentation',
    version: '1.0.0',
    description: 'API documentation for the 7irafie platform connecting artisans and clients',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: '7irafie Support',
      url: 'https://7irafie.com',
      email: 'support@7irafie.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['src/docs/*.yml', 'src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true,
  })
);

module.exports = router;