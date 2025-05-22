const multer = require('multer');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images and videos only
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Only images and videos are allowed'), false);
  }
};

// File size limits
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB max size
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = {
  upload,
};