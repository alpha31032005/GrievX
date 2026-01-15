const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied',
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can access this resource',
    });
  }
  next();
};

const citizenOnly = (req, res, next) => {
  if (req.userRole !== 'citizen') {
    return res.status(403).json({
      success: false,
      message: 'Only citizens can access this resource',
    });
  }
  next();
};

const officerOrAdmin = (req, res, next) => {
  if (!['officer', 'admin'].includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Only officers and admins can access this resource',
    });
  }
  next();
};

module.exports = {
  auth,
  adminOnly,
  citizenOnly,
  officerOrAdmin,
};
