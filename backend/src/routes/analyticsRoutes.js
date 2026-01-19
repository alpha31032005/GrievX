const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth, authAdminOrChief } = require('../middleware/auth');

// New endpoints (role-filtered: admin=dept, chief=all)
router.get('/overview', auth, authAdminOrChief, analyticsController.getOverview);
router.get('/monthly', auth, authAdminOrChief, analyticsController.getMonthly);
router.get('/category', auth, authAdminOrChief, analyticsController.getCategory);
router.get('/resolution', auth, authAdminOrChief, analyticsController.getResolution);
router.get('/map', auth, authAdminOrChief, analyticsController.getMap);
router.get('/activity', auth, authAdminOrChief, analyticsController.getActivity);
router.get('/system', auth, authAdminOrChief, analyticsController.getSystemStats);

// Citizen activity endpoint (user's own complaints)
router.get('/my-activity', auth, analyticsController.getMyActivity);

// Legacy endpoints
router.get('/heatmap', auth, authAdminOrChief, analyticsController.getWardHeatmap);
router.get('/category-trends', auth, authAdminOrChief, analyticsController.getCategoryTrends);
router.get('/statistics', auth, authAdminOrChief, analyticsController.getStatistics);
router.get('/top-wards', auth, authAdminOrChief, analyticsController.getTopWards);
router.get('/category-by-ward/:ward', auth, authAdminOrChief, analyticsController.getCategoryByWard);

module.exports = router;
