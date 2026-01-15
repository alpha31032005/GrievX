const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { auth, citizenOnly, officerOrAdmin } = require('../middleware/auth');
const { validate, validateComplaint, validateStatusUpdate } = require('../middleware/validator');

// Citizen routes
router.post('/create', auth, validate(validateComplaint), complaintController.createComplaint);
router.get('/my', auth, complaintController.getMyComplaints);
router.put('/:id/upvote', auth, complaintController.upvoteComplaint);

// Admin/Officer routes
router.get('/all', auth, officerOrAdmin, complaintController.getAllComplaints);
router.get('/:id', auth, complaintController.getComplaint);
router.put('/:id/status', auth, officerOrAdmin, validate(validateStatusUpdate), complaintController.updateComplaintStatus);
router.put('/:id/assign', auth, officerOrAdmin, complaintController.assignComplaint);

module.exports = router;
