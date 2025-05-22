const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: '7irafie API documentation',
    version,
    description: 'API documentation for 7irafie - a platform connecting artisans and clients',
    license: {
      name: 'MIT',
      url: 'https://github.com/yourname/7irafie/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
      description: 'Development server',
    },
  ],
};

module.exports = swaggerDef;