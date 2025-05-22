const httpStatus = require('http-status');
const { Post } = require('../models');
const ApiError = require('../utils/ApiError');
const cloudinary = require('../utils/cloudinary');

/**
 * Create a post
 * @param {Object} postBody
 * @param {Object} user - The authenticated user
 * @returns {Promise<Post>}
 */
const createPost = async (postBody, user) => {
  if (user.role !== 'artisan') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only artisans can create posts');
  }
  
  // Set the artisan ID from the authenticated user
  postBody.artisan = user.id;
  
  // Set the category from the artisan's profile
  postBody.category = user.category;
  
  return Post.create(postBody);
};

/**
 * Query for posts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryPosts = async (filter, options) => {
  const posts = await Post.paginate(filter, options);
  return posts;
};

/**
 * Get post by id
 * @param {ObjectId} id
 * @returns {Promise<Post>}
 */
const getPostById = async (id) => {
  return Post.findById(id).populate('artisan', 'firstName lastName email phone');
};

/**
 * Update post by id
 * @param {ObjectId} postId
 * @param {Object} updateBody
 * @param {Object} user - The authenticated user
 * @returns {Promise<Post>}
 */
const updatePostById = async (postId, updateBody, user) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  
  // Check if the user is the artisan who created the post
  if (post.artisan.id !== user.id && user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this post');
  }
  
  Object.assign(post, updateBody);
  await post.save();
  return post;
};

/**
 * Delete post by id
 * @param {ObjectId} postId
 * @param {Object} user - The authenticated user
 * @returns {Promise<Post>}
 */
const deletePostById = async (postId, user) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  
  // Check if the user is the artisan who created the post
  if (post.artisan.id !== user.id && user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to delete this post');
  }
  
  // Delete all media files from Cloudinary
  if (post.media && post.media.length > 0) {
    for (const media of post.media) {
      await cloudinary.deleteFile(media.public_id, media.type);
    }
  }
  
  await post.remove();
  return post;
};

/**
 * Upload media for a post
 * @param {Array<Buffer>} files - Array of file buffers
 * @param {Array<string>} fileTypes - Array of file types
 * @returns {Promise<Array>} - Array of uploaded media objects
 */
const uploadMedia = async (files, fileTypes) => {
  const mediaArray = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileType = fileTypes[i].startsWith('image/') ? 'image' : 'video';
    
    const result = await cloudinary.uploadFile(file, 'posts', fileType);
    
    mediaArray.push({
      url: result.secure_url,
      type: fileType,
      public_id: result.public_id,
    });
  }
  
  return mediaArray;
};

/**
 * Delete media from a post
 * @param {string} postId - The post ID
 * @param {string} mediaId - The media ID to delete
 * @param {Object} user - The authenticated user
 * @returns {Promise<Post>} - The updated post
 */
const deleteMedia = async (postId, mediaId, user) => {
  const post = await getPostById(postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  
  // Check if the user is the artisan who created the post
  if (post.artisan.id !== user.id && user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this post');
  }
  
  // Find the media in the post
  const mediaIndex = post.media.findIndex((m) => m.id === mediaId);
  if (mediaIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Media not found in post');
  }
  
  // Delete the media from Cloudinary
  const media = post.media[mediaIndex];
  await cloudinary.deleteFile(media.public_id, media.type);
  
  // Remove the media from the post
  post.media.splice(mediaIndex, 1);
  await post.save();
  
  return post;
};

module.exports = {
  createPost,
  queryPosts,
  getPostById,
  updatePostById,
  deletePostById,
  uploadMedia,
  deleteMedia,
};