const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');

const mlService = {
  // Classify text using ML service
  classifyText: async (text) => {
    try {
      const response = await axios.post(
        `${config.ML_SERVICE_URL}${config.ML_TEXT_ENDPOINT}`,
        { text },
        { timeout: 30000 }
      );

      return {
        category: response.data.category || response.data.prediction,
        confidence: response.data.confidence || 0,
      };
    } catch (error) {
      logger.error('ML Service - Text Classification Error:', error.message);
      throw new Error('Failed to classify text');
    }
  },

  // Classify image using ML service
  classifyImage: async (imageUrl) => {
    try {
      const response = await axios.post(
        `${config.ML_SERVICE_URL}${config.ML_IMAGE_ENDPOINT}`,
        { image_url: imageUrl },
        { timeout: 60000 }
      );

      return {
        category: response.data.category || response.data.prediction,
        confidence: response.data.confidence || 0,
      };
    } catch (error) {
      logger.error('ML Service - Image Classification Error:', error.message);
      throw new Error('Failed to classify image');
    }
  },

  // Check if ML service is healthy
  healthCheck: async () => {
    try {
      const response = await axios.get(`${config.ML_SERVICE_URL}/health`, {
        timeout: 5000,
      });
      return response.data.status === 'healthy';
    } catch (error) {
      logger.warn('ML Service Health Check Failed:', error.message);
      return false;
    }
  },
};

module.exports = mlService;
