const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const { tokenService } = require('../services');

const auth = (...requiredRights) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
    
    const token = authHeader.substring(7);
    
    // Verify token and get user
    const tokenDoc = await tokenService.verifyToken(token, 'access');
    req.user = tokenDoc.user;
    
    if (requiredRights.length) {
      const userRights = roleRights.get(req.user.role);
      const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
      
      if (!hasRequiredRights) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }
    }
    
    next();
  } catch (error) {
    next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
};

module.exports = auth;