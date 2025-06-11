const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const { userService } = require('../services');
const config = require('../config/config');

const auth = (...requiredRights) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
    
    const token = authHeader.substring(7);
    
    // Verify JWT token directly
    const payload = jwt.verify(token, config.jwt.secret);
    
    // Get user from database
    const user = await userService.getUserById(payload.sub);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
    }
    
    req.user = user;
    
    if (requiredRights.length) {
      const userRights = roleRights.get(req.user.role);
      const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
      
      if (!hasRequiredRights) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }
    }
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(httpStatus.UNAUTHORIZED, 'Token expired'));
    } else {
      next(error);
    }
  }
};

module.exports = auth;