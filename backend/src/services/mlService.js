const axios = require('axios');
const FormData = require('form-data');
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

  // Classify image using ML service (supports both URL and file buffer)
  classifyImage: async (imageInput) => {
    try {
      let response;
      
      // If it's a URL string, send as JSON
      if (typeof imageInput === 'string') {
        response = await axios.post(
          `${config.ML_SERVICE_URL}${config.ML_IMAGE_ENDPOINT}`,
          { image_url: imageInput },
          { timeout: 60000 }
        );
      } 
      // If it's a file buffer/stream, send as FormData
      else if (imageInput.buffer || imageInput.path) {
        const formData = new FormData();
        
        // Append the buffer with proper metadata
        formData.append('file', imageInput.buffer, {
          filename: imageInput.originalname || 'image.jpg',
          contentType: imageInput.mimetype || 'image/jpeg',
        });
        
        response = await axios.post(
          `${config.ML_SERVICE_URL}${config.ML_IMAGE_ENDPOINT}`,
          formData,
          { 
            timeout: 60000,
            headers: {
              ...formData.getHeaders(),
            },
          }
        );
      } else {
        throw new Error('Invalid image input format');
      }

      // Return standardized response
      return {
        prediction: response.data.prediction || response.data.category,
        confidence: response.data.confidence || 0,
        category: response.data.prediction || response.data.category,
      };
    } catch (error) {
      logger.error('ML Service - Image Classification Error:', error.message);
      if (error.response) {
        logger.error('ML Service Response:', error.response.data);
      }
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
