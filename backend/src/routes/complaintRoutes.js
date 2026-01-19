const express = require('express');
const multer = require('multer');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { auth, authCitizen, authAdminOrChief } = require('../middleware/auth');
const { validate, validateComplaint, validateStatusUpdate } = require('../middleware/validator');

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
});

// Citizen routes
router.post('/', auth, upload.single('image'), complaintController.createComplaintSimple);
router.post('/create', auth, validate(validateComplaint), complaintController.createComplaint);
router.get('/my', auth, authCitizen, complaintController.getMyComplaints);
router.get('/user/me', auth, complaintController.getMyComplaints);
router.put('/:id/upvote', auth, complaintController.upvoteComplaint);

// Admin/Chief routes (auto-filtered by department for admins)
router.get('/all', auth, authAdminOrChief, complaintController.getAllComplaints);
router.get('/:id', auth, complaintController.getComplaint);
router.put('/:id/status', auth, authAdminOrChief, validate(validateStatusUpdate), complaintController.updateComplaintStatus);
router.put('/:id/assign', auth, authAdminOrChief, complaintController.assignComplaint);

module.exports = router;
