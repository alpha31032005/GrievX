const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRY }
  );
};

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.validated;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'citizen',
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.validated;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user);

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name: name || undefined,
        phone: phone || undefined,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    logger.info(`User profile updated: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
