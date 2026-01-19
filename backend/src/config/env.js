require('dotenv').config();

module.exports = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-civic',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',

  // ML Service
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  ML_TEXT_ENDPOINT: '/ml/text/classify',
  ML_IMAGE_ENDPOINT: '/ml/image/classify',


  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],

  // Categories / Departments
  DEPARTMENTS: ['garbage', 'electric_poles', 'fallen_trees', 'potholes', 'misc'],
  COMPLAINT_CATEGORIES: ['garbage', 'pothole', 'fallen_trees', 'electric_poles'],

  // Severity Levels
  SEVERITY_LEVELS: ['low', 'medium', 'high', 'critical'],

  // Status
  COMPLAINT_STATUS: ['open', 'in_progress', 'resolved', 'closed'],

  // Hard-coded Admin Credentials (department-based)
  ADMIN_CREDENTIALS: [
    { email: 'admin.garbage@civic.gov', password: 'Admin@123', department: 'garbage' },
    { email: 'admin.electric@civic.gov', password: 'Admin@123', department: 'electric_poles' },
    { email: 'admin.trees@civic.gov', password: 'Admin@123', department: 'fallen_trees' },
    { email: 'admin.roads@civic.gov', password: 'Admin@123', department: 'potholes' },
    { email: 'admin.misc@civic.gov', password: 'Admin@123', department: 'misc' },
  ],

  // Hard-coded Chief Credential
  CHIEF_CREDENTIAL: {
    email: 'chief@civic.gov',
    password: 'Chief@123',
  },

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
