const httpStatus = require('http-status');
const { Order, Post } = require('../models');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');
const userService = require('./user.service');

/**
 * Create an order
 * @param {Object} orderBody
 * @param {Object} user - The authenticated user (client)
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody, user) => {
  if (user.role !== 'client') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only clients can create orders');
  }
  
  // Get the post details
  const post = await Post.findById(orderBody.post).populate('artisan');
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  
  if (!post.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This post is no longer active');
  }
  
  // Set the client ID from the authenticated user
  orderBody.client = user.id;
  
  // Set the artisan ID from the post
  orderBody.artisan = post.artisan.id;
  
  // Calculate total price
  const quantity = orderBody.quantity || 1;
  orderBody.totalPrice = post.price * quantity;
  
  // Create the order
  const order = await Order.create(orderBody);
  
  // Send notifications
  const client = await userService.getUserById(user.id);
  const artisan = post.artisan;
  
  // Send order confirmation to client
  await emailService.sendOrderConfirmationEmail(client.email, order);
  
  // Send new order notification to artisan
  await emailService.sendNewOrderNotificationEmail(artisan.email, order);
  
  return order.populate([
    { path: 'client', select: 'firstName lastName email phone' },
    { path: 'artisan', select: 'firstName lastName email phone' },
    { path: 'post', select: 'title description price media' }
  ]);
};

/**
 * Query for orders
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryOrders = async (filter, options) => {
  const orders = await Order.paginate(filter, options);
  return orders;
};

/**
 * Get order by id
 * @param {ObjectId} id
 * @returns {Promise<Order>}
 */
const getOrderById = async (id) => {
  return Order.findById(id).populate([
    { path: 'client', select: 'firstName lastName email phone' },
    { path: 'artisan', select: 'firstName lastName email phone' },
    { path: 'post', select: 'title description price media' }
  ]);
};

/**
 * Update order by id
 * @param {ObjectId} orderId
 * @param {Object} updateBody
 * @param {Object} user - The authenticated user
 * @returns {Promise<Order>}
 */
const updateOrderById = async (orderId, updateBody, user) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  
  // Check permissions
  if (user.role === 'client' && order.client.id !== user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this order');
  }
  
  if (user.role === 'artisan' && order.artisan.id !== user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this order');
  }
  
  // Clients can only cancel their orders
  if (user.role === 'client') {
    if (updateBody.status && updateBody.status !== 'cancelled') {
      throw new ApiError(httpStatus.FORBIDDEN, 'Clients can only cancel orders');
    }
    
    // Cannot cancel if already accepted or completed
    if (updateBody.status === 'cancelled' && 
       (order.status === 'accepted' || order.status === 'completed')) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot cancel an accepted or completed order');
    }
  }
  
  // Artisans can update status to accepted, rejected, or completed
  if (user.role === 'artisan') {
    if (updateBody.status && 
       !['accepted', 'rejected', 'completed'].includes(updateBody.status)) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Artisans can only accept, reject, or complete orders');
    }
    
    // Cannot change status if cancelled
    if (order.status === 'cancelled') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update a cancelled order');
    }
  }
  
  // Store previous status for notification
  const previousStatus = order.status;
  
  Object.assign(order, updateBody);
  await order.save();
  
  // Send status update notification if status changed
  if (updateBody.status && previousStatus !== updateBody.status) {
    // Notify client
    await emailService.sendOrderStatusUpdateEmail(order.client.email, order);
    
    // Notify artisan if client cancelled
    if (updateBody.status === 'cancelled' && user.role === 'client') {
      await emailService.sendOrderStatusUpdateEmail(order.artisan.email, order);
    }
  }
  
  return order;
};

/**
 * Delete order by id
 * @param {ObjectId} orderId
 * @param {Object} user - The authenticated user
 * @returns {Promise<Order>}
 */
const deleteOrderById = async (orderId, user) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  
  // Check permissions - only admin can delete orders
  if (user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only administrators can delete orders');
  }
  
  await order.remove();
  return order;
};

module.exports = {
  createOrder,
  queryOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
};