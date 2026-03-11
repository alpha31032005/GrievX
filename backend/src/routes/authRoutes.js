const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validate, validateRegister, validateLogin, validateOTPRequest, validateOTPVerify } = require('../middleware/validator');

// Public routes
router.post('/register', validate(validateRegister), authController.register);
router.post('/login', validate(validateLogin), authController.login);

// OTP routes
router.post('/request-otp', validate(validateOTPRequest), authController.requestOTP);
router.post('/verify-otp', validate(validateOTPVerify), authController.verifyOTP);

module.exports = router;
