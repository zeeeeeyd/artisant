const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPost = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    type: Joi.string().valid('vente', 'commande').required(),
    price: Joi.number().min(0).required(),
    paymentMethod: Joi.string().valid('main à main', 'en ligne').required(),
    delivery: Joi.string().valid('disponible', 'retrait sur place').required(),
    media: Joi.array().items(
      Joi.object().keys({
        url: Joi.string().required(),
        type: Joi.string().valid('image', 'video').required(),
        public_id: Joi.string().required(),
      })
    ).optional(),
  }),
};

const getPosts = {
  query: Joi.object().keys({
    artisan: Joi.string().custom(objectId),
    title: Joi.string(),
    type: Joi.string().valid('vente', 'commande'),
    category: Joi.string().valid('couture', 'cuisine', 'peinture', 'électricité'),
    priceMin: Joi.number().min(0),
    priceMax: Joi.number().min(0),
    paymentMethod: Joi.string().valid('main à main', 'en ligne'),
    delivery: Joi.string().valid('disponible', 'retrait sur place'),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

const updatePost = {
  params: Joi.object().keys({
    postId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      description: Joi.string(),
      type: Joi.string().valid('vente', 'commande'),
      price: Joi.number().min(0),
      paymentMethod: Joi.string().valid('main à main', 'en ligne'),
      delivery: Joi.string().valid('disponible', 'retrait sur place'),
      isActive: Joi.boolean(),
      // Media validation removed from update since it's handled separately
    })
    .min(1),
};

const deletePost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

const uploadMedia = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

const deleteMedia = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
    mediaId: Joi.string().required(),
  }),
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  uploadMedia,
  deleteMedia,
};