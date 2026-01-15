const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validate, validateRegister, validateLogin } = require('../middleware/validator');

// Public routes
router.post('/register', validate(validateRegister), authController.register);
router.post('/login', validate(validateLogin), authController.login);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
