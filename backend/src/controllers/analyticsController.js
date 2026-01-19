const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

// Helper: get department from request (admin=filtered, chief=all)
const getDept = (req) => (req.userRole === 'admin' ? req.userDepartment : null);

// ─────────────────────────────────────────────────────────────
// NEW ENDPOINTS
// ─────────────────────────────────────────────────────────────

// GET /analytics/overview
const getOverview = async (req, res) => {
  try {
    const data = await analyticsService.getOverview(getDept(req));
    res.json({ success: true, ...data });
  } catch (e) {
    logger.error('Overview error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to fetch overview' });
  }
};

// GET /analytics/monthly
const getMonthly = async (req, res) => {
  try {
    const data = await analyticsService.getMonthly(getDept(req), +req.query.months || 6);
    res.json({ success: true, data });
  } catch (e) {
    logger.error('Monthly error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to fetch monthly data' });
  }
};

// GET /analytics/category
const getCategory = async (req, res) => {
  try {
    const data = await analyticsService.getCategoryDistribution(getDept(req));
    res.json({ success: true, data });
  } catch (e) {
    logger.error('Category error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to fetch category data' });
  }
};

// GET /analytics/resolution
const getResolution = async (req, res) => {
  try {
    const data = await analyticsService.getResolutionDistribution(getDept(req));
    res.json({ success: true, data });
  } catch (e) {
    logger.error('Resolution error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to fetch resolution data' });
  }
};

// GET /analytics/map
const getMap = async (req, res) => {
  try {
    const data = await analyticsService.getMapData(getDept(req));
    res.json({ success: true, data });
  } catch (e) {
    logger.error('Map error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to fetch map data' });
  }
};

// GET /analytics/activity - Recent activity logs
const getActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await analyticsService.getRecentActivity(getDept(req), limit);
    res.json({ success: true, data });
  } catch (e) {
    logger.error('Activity error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to fetch activity data' });
  }
};

// GET /analytics/my-activity - User's own activity (for citizens)
const getMyActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await analyticsService.getRecentActivity(null, limit, req.userId);
    res.json({ success: true, data });
  } catch (e) {
    logger.error('My activity error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to fetch activity data' });
  }
};

// GET /analytics/system - System health stats
const getSystemStats = async (req, res) => {
  try {
    const data = await analyticsService.getSystemStats();
    res.json({ success: true, ...data });
  } catch (e) {
    logger.error('System stats error:', e.message);
    res.status(500).json({ success: false, message: 'Failed to fetch system stats' });
  }
};

// ─────────────────────────────────────────────────────────────
// EXISTING ENDPOINTS (kept for backward compatibility)
// ─────────────────────────────────────────────────────────────

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
  // New endpoints
  getOverview,
  getMonthly,
  getCategory,
  getResolution,
  getMap,
  getActivity,
  getMyActivity,
  getSystemStats,
  // Legacy endpoints
  getWardHeatmap,
  getCategoryTrends,
  getStatistics,
  getTopWards,
  getCategoryByWard,
};
