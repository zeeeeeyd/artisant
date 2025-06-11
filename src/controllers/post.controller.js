const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { postService } = require('../services');

const createPost = catchAsync(async (req, res) => {
  // Ensure user is authenticated and is an artisan
  if (!req.user || req.user.role !== 'artisan') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only artisans can create posts');
  }

  // Handle file uploads first
  let mediaArray = [];
  if (req.files && req.files.length > 0) {
    const fileBuffers = req.files.map(file => file.buffer);
    const fileTypes = req.files.map(file => file.mimetype);
    mediaArray = await postService.uploadMedia(fileBuffers, fileTypes);
  }

  // Create post with media
  const postData = {
    ...req.body,
    media: mediaArray,
    artisan: req.user.id // Ensure artisan ID is set from authenticated user
  };

  const post = await postService.createPost(postData, req.user);
  res.status(httpStatus.CREATED).send(post);
});

const getPosts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['artisan', 'title', 'type', 'category', 'isActive']);

  // Handle price range filter
  if (req.query.priceMin || req.query.priceMax) {
    filter.price = {};
    if (req.query.priceMin) {
      filter.price.$gte = parseFloat(req.query.priceMin);
    }
    if (req.query.priceMax) {
      filter.price.$lte = parseFloat(req.query.priceMax);
    }
  }

  // Handle payment and delivery filters
  if (req.query.paymentMethod) {
    filter.paymentMethod = req.query.paymentMethod;
  }
  if (req.query.delivery) {
    filter.delivery = req.query.delivery;
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'artisan'; // Always populate artisan details

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
  // Handle new media uploads if any
  let newMedia = [];
  if (req.files && req.files.length > 0) {
    const fileBuffers = req.files.map(file => file.buffer);
    const fileTypes = req.files.map(file => file.mimetype);
    newMedia = await postService.uploadMedia(fileBuffers, fileTypes);
  }

  // Get existing post
  const existingPost = await postService.getPostById(req.params.postId);
  if (!existingPost) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // Combine existing and new media
  const updateData = {
    ...req.body,
    media: [...(existingPost.media || []), ...newMedia]
  };

  const post = await postService.updatePostById(req.params.postId, updateData, req.user);
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

  // Verify ownership
  if (post.artisan.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to modify this post');
  }

  const fileBuffers = req.files.map(file => file.buffer);
  const fileTypes = req.files.map(file => file.mimetype);
  const mediaArray = await postService.uploadMedia(fileBuffers, fileTypes);

  // Update post with new media
  post.media = [...post.media, ...mediaArray];
  await post.save();

  res.send(post);
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