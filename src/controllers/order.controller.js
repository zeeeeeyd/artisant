const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { orderService } = require('../services');

const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.body, req.user);
  res.status(httpStatus.CREATED).send(order);
});

const getOrders = catchAsync(async (req, res) => {
  let filter = pick(req.query, ['post', 'status', 'paymentStatus', 'paymentMethod', 'deliveryMethod']);
  
  // Apply user-specific filters based on role
  if (req.user.role === 'client') {
    // Clients can only see their own orders
    filter.client = req.user.id;
  } else if (req.user.role === 'artisan') {
    // Artisans can only see orders for their posts
    filter.artisan = req.user.id;
  } else if (req.user.role === 'admin') {
    // Admins can see all orders, and can filter by client or artisan if provided
    if (req.query.client) {
      filter.client = req.query.client;
    }
    if (req.query.artisan) {
      filter.artisan = req.query.artisan;
    }
  }
  
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await orderService.queryOrders(filter, options);
  res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  
  // Check permissions
  if (req.user.role === 'client' && order.client.id !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to view this order');
  }
  
  if (req.user.role === 'artisan' && order.artisan.id !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to view this order');
  }
  
  res.send(order);
});

const updateOrder = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderById(req.params.orderId, req.body, req.user);
  res.send(order);
});

const deleteOrder = catchAsync(async (req, res) => {
  await orderService.deleteOrderById(req.params.orderId, req.user);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
};