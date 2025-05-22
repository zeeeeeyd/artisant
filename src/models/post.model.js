const mongoose = require('mongoose');
const toJSON = require('./plugins/toJSON.js');
const paginate = require('./plugins/paginate.js');


const postSchema = mongoose.Schema(
  {
    artisan: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    media: [
      {
        url: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['image', 'video'],
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    type: {
      type: String,
      enum: ['vente', 'commande'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['main à main', 'en ligne'],
      required: true,
    },
    delivery: {
      type: String,
      enum: ['disponible', 'retrait sur place'],
      required: true,
    },
    category: {
      type: String,
      enum: ['couture', 'cuisine', 'peinture', 'électricité'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
postSchema.plugin(toJSON);
postSchema.plugin(paginate);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;