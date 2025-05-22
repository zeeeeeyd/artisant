const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const postRoute = require('./post.route');
const orderRoute = require('./order.route');
const docsRoute = require('./docs.route');
const config = require('../config/config');

const router = express.Router();


const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/posts',
    route: postRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
];

const devRoutes = [
  {
    path: '/docs',
    route: docsRoute,
  },
];

// Apply default routes
defaultRoutes.forEach((route) => {
  console.log(`Registering route: /v1${route.path}`);
  router.use(route.path, route.route);
});

// Apply dev routes in development
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    console.log(`Registering dev route: /v1${route.path}`);
    router.use(route.path, route.route);
  });
}

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API!',
    version: '1.0.0',
    description: 'This is the base route for the API.',
    timestamp: new Date().toISOString(),
  });
});

router.get('/test', (req, res) => {
  res.json({
    message: 'API test endpoint is working!',
    timestamp: new Date().toISOString(),
    environment: config.env
  });
});

module.exports = router;