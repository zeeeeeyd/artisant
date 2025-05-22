const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { postService } = require('../services');

const createPost = catchAsync(async (req, res) => {
  let mediaArray = [];
  
  if (req.files && req.files.length > 0) {
    const fileBuffers = req.files.map(file => file.buffer);
    const fileTypes = req.files.map(file => file.mimetype);
    
    mediaArray = await postService.uploadMedia(fileBuffers, fileTypes);
  }
  

  const postBody = {
    ...req.body,
    media: mediaArray
  };
  
  const post = await postService.createPost(postBody, req.user);
  res.status(httpStatus.CREATED).send(post);
});

const getPosts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['artisan', 'title', 'type', 'category', 'isActive']);
  

  if (req.query.priceMin || req.query.priceMax) {
    filter.price = {};
    if (req.query.priceMin) {
      filter.price.$gte = parseInt(req.query.priceMin, 10);
    }
    if (req.query.priceMax) {
      filter.price.$lte = parseInt(req.query.priceMax, 10);
    }
  }
  
  // Handle other filters
  if (req.query.paymentMethod) {
    filter.paymentMethod = req.query.paymentMethod;
  }
  
  if (req.query.delivery) {
    filter.delivery = req.query.delivery;
  }
  
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await postService.queryPosts(filter, options);
  res.send(result);
});

const getPost = catchAsync(async (req, res) => {
  const post = await postService.getPostById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  res.send(post);
});

const updatePost = catchAsync(async (req, res) => {
  // Handle file uploads for updates if files are provided
  let additionalMedia = [];
  
  if (req.files && req.files.length > 0) {
    const fileBuffers = req.files.map(file => file.buffer);
    const fileTypes = req.files.map(file => file.mimetype);
    
    additionalMedia = await postService.uploadMedia(fileBuffers, fileTypes);
  }
  
  const existingPost = await postService.getPostById(req.params.postId);
  if (!existingPost) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  const updateBody = {
    ...req.body,
    media: [...(existingPost.media || []), ...additionalMedia]
  };
  
  const post = await postService.updatePostById(req.params.postId, updateBody, req.user);
  res.send(post);
});

const deletePost = catchAsync(async (req, res) => {
  await postService.deletePostById(req.params.postId, req.user);
  res.status(httpStatus.NO_CONTENT).send();
});

const uploadMedia = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files provided');
  }
  
  const post = await postService.getPostById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  
  if (post.artisan.id !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this post');
  }

  const fileBuffers = req.files.map(file => file.buffer);
  const fileTypes = req.files.map(file => file.mimetype);
  
  const mediaArray = await postService.uploadMedia(fileBuffers, fileTypes);

  post.media = [...post.media, ...mediaArray];
  await post.save();
  
  res.status(httpStatus.OK).send(post);
});

const deleteMedia = catchAsync(async (req, res) => {
  const post = await postService.deleteMedia(req.params.postId, req.params.mediaId, req.user);
  res.send(post);
});

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  uploadMedia,
  deleteMedia,
};