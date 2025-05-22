const cloudinary = require('cloudinary').v2;
const config = require('../config/config');
const logger = require('../config/logger');

// Configure cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

/**
 * Upload a file to cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} folder - The folder to upload to
 * @param {string} resourceType - The resource type (image or video)
 * @returns {Promise<Object>} - The upload result
 */
const uploadFile = (fileBuffer, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `7irafie/${folder}`,
      resource_type: resourceType,
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        logger.error('Cloudinary upload error:', error);
        return reject(error);
      }
      resolve(result);
    });

    // Convert buffer to stream and pipe to uploadStream
    const Readable = require('stream').Readable;
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete a file from cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @param {string} resourceType - The resource type (image or video)
 * @returns {Promise<Object>} - The delete result
 */
const deleteFile = (publicId, resourceType = 'image') => {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = {
  uploadFile,
  deleteFile,
};