const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth, adminOnly } = require('../middleware/auth');

// All routes require admin authentication
router.get('/heatmap', auth, adminOnly, analyticsController.getWardHeatmap);
router.get('/category-trends', auth, adminOnly, analyticsController.getCategoryTrends);
router.get('/statistics', auth, adminOnly, analyticsController.getStatistics);
router.get('/top-wards', auth, adminOnly, analyticsController.getTopWards);
router.get('/category-by-ward/:ward', auth, adminOnly, analyticsController.getCategoryByWard);

module.exports = router;
