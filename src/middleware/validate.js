const Joi = require('joi');
const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  
  // Handle multipart/form-data by allowing unknown keys in body
  const options = {
    errors: { label: 'key' }, 
    abortEarly: false
  };
  
  // If this is a multipart request (has files), allow unknown keys
  if (req.files && req.files.length > 0) {
    options.allowUnknown = true;
    options.stripUnknown = false;
  }
  
  const { value, error } = Joi.compile(validSchema)
    .prefs(options)
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  
  Object.assign(req, value);
  return next();
};

module.exports = validate;