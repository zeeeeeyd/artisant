const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOrder = {
  body: Joi.object().keys({
    post: Joi.string().custom(objectId).required(),
    description: Joi.string().allow('', null),
    quantity: Joi.number().integer().min(1).default(1),
    desiredPickupDate: Joi.date(),
    paymentMethod: Joi.string().valid('main à main', 'en ligne').required(),
    deliveryMethod: Joi.string().valid('livraison', 'retrait sur place').required(),
    deliveryAddress: Joi.object().keys({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required(),
    }).when('deliveryMethod', {
      is: 'livraison',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
};

const getOrders = {
  query: Joi.object().keys({
    client: Joi.string().custom(objectId),
    artisan: Joi.string().custom(objectId),
    post: Joi.string().custom(objectId),
    status: Joi.string().valid('pending', 'accepted', 'rejected', 'completed', 'cancelled'),
    paymentStatus: Joi.string().valid('pending', 'paid', 'refunded'),
    paymentMethod: Joi.string().valid('main à main', 'en ligne'),
    deliveryMethod: Joi.string().valid('livraison', 'retrait sur place'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const updateOrder = {
  params: Joi.object().keys({
    orderId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string().valid('pending', 'accepted', 'rejected', 'completed', 'cancelled'),
      paymentStatus: Joi.string().valid('pending', 'paid', 'refunded'),
      description: Joi.string().allow('', null),
      desiredPickupDate: Joi.date(),
    })
    .min(1),
};

const deleteOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
};