const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

// Generate JWT token with role and department
const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRY });
};

// ─────────────────────────────────────────────────────────────
// CITIZEN: Register (only citizens can register)
// ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.validated || req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'citizen', // Force citizen role on registration
      department: null,
    });

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: 'citizen',
      department: null,
    });

    logger.info(`Citizen registered: ${email}`);
    res.status(201).json({ success: true, token, user: user.toJSON() });
  } catch (error) {
    logger.error('Registration error:', error.message);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// ─────────────────────────────────────────────────────────────
// UNIFIED LOGIN: Citizens, Admins (hard-coded), Chief (hard-coded)
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.validated || req.body;

    // 1. Check CHIEF (hard-coded)
    if (email === config.CHIEF_CREDENTIAL.email) {
      if (password !== config.CHIEF_CREDENTIAL.password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const token = generateToken({ id: 'chief', email, name: 'Chief Officer', role: 'chief', department: null });
      logger.info(`Chief logged in: ${email}`);
      return res.json({
        success: true,
        token,
        user: { email, role: 'chief', name: 'Chief Officer', department: null },
      });
    }

    // 2. Check ADMIN (hard-coded, department-based)
    const adminMatch = config.ADMIN_CREDENTIALS.find((a) => a.email === email);
    if (adminMatch) {
      if (password !== adminMatch.password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      const adminName = `${adminMatch.department.replace('_', ' ')} Admin`;
      const token = generateToken({
        id: `admin_${adminMatch.department}`,
        email,
        name: adminName,
        role: 'admin',
        department: adminMatch.department,
      });
      logger.info(`Admin logged in: ${email} (${adminMatch.department})`);
      return res.json({
        success: true,
        token,
        user: {
          email,
          role: 'admin',
          name: `${adminMatch.department.replace('_', ' ')} Admin`,
          department: adminMatch.department,
        },
      });
    }

    // 3. Check CITIZEN (from database)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is inactive' });
    }
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    });

    logger.info(`Citizen logged in: ${email}`);
    res.json({ success: true, token, user: user.toJSON() });
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET PROFILE
// ─────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    // For hard-coded admin/chief, return info from token
    if (req.userRole === 'chief') {
      return res.json({
        success: true,
        user: { email: req.userEmail, role: 'chief', name: 'Chief Officer', department: null },
      });
    }
    if (req.userRole === 'admin') {
      return res.json({
        success: true,
        user: {
          email: req.userEmail,
          role: 'admin',
          name: `${req.userDepartment?.replace('_', ' ')} Admin`,
          department: req.userDepartment,
        },
      });
    }

    // For citizens, fetch from DB
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: user.toJSON() });
  } catch (error) {
    logger.error('Get profile error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PROFILE (citizens only)
// ─────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    if (req.userRole !== 'citizen') {
      return res.status(403).json({ success: false, message: 'Only citizens can update profile' });
    }

    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    logger.info(`Profile updated: ${user.email}`);
    res.json({ success: true, message: 'Profile updated', user: user.toJSON() });
  } catch (error) {
    logger.error('Update profile error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

module.exports = { register, login, getProfile, updateProfile };
