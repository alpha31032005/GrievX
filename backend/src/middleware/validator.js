const Joi = require('joi');
const config = require('../config/env');

// Registration validation
const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string()
      .valid('citizen', 'admin', 'officer')
      .default('citizen'),
  });
  return schema.validate(data);
};

// Login validation
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

// Complaint creation validation
const validateComplaint = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(2000).required(),
    ward: Joi.number().integer().min(1).required(),
    category: Joi.string()
      .valid(...config.COMPLAINT_CATEGORIES)
      .required(),
    severity: Joi.string().valid(...config.SEVERITY_LEVELS),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
  });
  return schema.validate(data);
};

// Update complaint status validation
const validateStatusUpdate = (data) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid(...config.COMPLAINT_STATUS)
      .required(),
    resolution: Joi.string().optional(),
  });
  return schema.validate(data);
};

// Pagination validation
const validatePagination = (data) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  });
  return schema.validate(data);
};

// Middleware to validate request
const validate = (validationFunc) => {
  return (req, res, next) => {
    const { error, value } = validationFunc(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    req.validated = value;
    next();
  };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateComplaint,
  validateStatusUpdate,
  validatePagination,
  validate,
};
