const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

// Get ward heatmap data
const getWardHeatmap = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const heatmapData = await analyticsService.getWardHeatmap(startDate, endDate);

    res.json({
      success: true,
      heatmapData,
    });
  } catch (error) {
    logger.error('Heatmap error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heatmap data',
    });
  }
};

// Get category trends
const getCategoryTrends = async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const trends = await analyticsService.getCategoryTrends(parseInt(months));

    res.json({
      success: true,
      trends,
    });
  } catch (error) {
    logger.error('Category trends error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category trends',
    });
  }
};

// Get overall statistics
const getStatistics = async (req, res) => {
  try {
    const stats = await analyticsService.getStatistics();

    res.json({
      success: true,
      statistics: stats,
    });
  } catch (error) {
    logger.error('Statistics error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
};

// Get top wards by complaint count
const getTopWards = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topWards = await analyticsService.getTopWards(parseInt(limit));

    res.json({
      success: true,
      topWards,
    });
  } catch (error) {
    logger.error('Top wards error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top wards',
    });
  }
};

// Get category distribution by ward
const getCategoryByWard = async (req, res) => {
  try {
    const { ward } = req.params;

    if (!ward) {
      return res.status(400).json({
        success: false,
        message: 'Ward number is required',
      });
    }

    const data = await analyticsService.getCategoryByWard(ward);

    res.json({
      success: true,
      ward,
      data,
    });
  } catch (error) {
    logger.error('Category by ward error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category distribution',
    });
  }
};

module.exports = {
  getWardHeatmap,
  getCategoryTrends,
  getStatistics,
  getTopWards,
  getCategoryByWard,
};
