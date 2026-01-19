const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────
// AUTH: Verify JWT and attach user info to request
// ─────────────────────────────────────────────────────────────
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, access denied' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    req.userDepartment = decoded.department || null;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ─────────────────────────────────────────────────────────────
// ROLE GUARDS
// ─────────────────────────────────────────────────────────────
const authCitizen = (req, res, next) => {
  if (req.userRole !== 'citizen') {
    return res.status(403).json({ success: false, message: 'Citizens only' });
  }
  next();
};

const authAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admins only' });
  }
  next();
};

const authChief = (req, res, next) => {
  if (req.userRole !== 'chief') {
    return res.status(403).json({ success: false, message: 'Chief only' });
  }
  next();
};

const authAdminOrChief = (req, res, next) => {
  if (!['admin', 'chief'].includes(req.userRole)) {
    return res.status(403).json({ success: false, message: 'Admin or Chief required' });
  }
  next();
};

// ─────────────────────────────────────────────────────────────
// DEPARTMENT FILTER: Auto-filter complaints by admin's department
// Usage: In complaint queries, use buildDepartmentFilter(req) 
// ─────────────────────────────────────────────────────────────
const buildDepartmentFilter = (req) => {
  // Chief sees ALL complaints
  if (req.userRole === 'chief') {
    return {};
  }
  // Admin sees only their department's complaints
  if (req.userRole === 'admin' && req.userDepartment) {
    return { department: req.userDepartment };
  }
  // Citizens see only their own complaints (handled in controller)
  return {};
};

module.exports = {
  auth,
  authCitizen,
  authAdmin,
  authChief,
  authAdminOrChief,
  buildDepartmentFilter,
  // Legacy exports for backward compatibility
  adminOnly: authAdmin,
  citizenOnly: authCitizen,
  officerOrAdmin: authAdminOrChief,
};
