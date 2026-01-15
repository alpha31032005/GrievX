const Complaint = require('../models/Complaint');
const User = require('../models/User');
const mlService = require('../services/mlService');
const config = require('../config/env');
const logger = require('../utils/logger');

// Create new complaint
const createComplaint = async (req, res) => {
  try {
    const { title, description, ward, category, severity, latitude, longitude, imageUrl } = req.validated;

    // Create complaint object
    let complaintData = {
      userId: req.userId,
      title,
      description,
      ward,
      category,
      severity: severity || 'medium',
    };

    // Add location if provided
    if (latitude && longitude) {
      complaintData.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    // Try text classification via ML service
    try {
      const textPrediction = await mlService.classifyText(`${title} ${description}`);
      complaintData.categoryConfidence = textPrediction.confidence;
    } catch (error) {
      logger.warn('ML Service text classification failed:', error.message);
    }

    // Try image classification if image provided
    if (imageUrl) {
      try {
        const imagePrediction = await mlService.classifyImage(imageUrl);
        complaintData.imageUrl = imageUrl;
        complaintData.imageMLPrediction = imagePrediction.category;
        complaintData.imageMLConfidence = imagePrediction.confidence;
      } catch (error) {
        logger.warn('ML Service image classification failed:', error.message);
      }
    }

    const complaint = new Complaint(complaintData);
    await complaint.save();

    logger.info(`Complaint created: ${complaint._id} by user ${req.userId}`);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: complaint.toObject(),
    });
  } catch (error) {
    logger.error('Create complaint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint',
    });
  }
};

// Get my complaints (citizen)
const getMyComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const complaints = await Complaint.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email');

    const total = await Complaint.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get my complaints error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
    });
  }
};

// Get all complaints (admin/officer)
const getAllComplaints = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, ward } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (ward) query.ward = parseInt(ward);

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email');

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get all complaints error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
    });
  }
};

// Get single complaint
const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.json({
      success: true,
      complaint,
    });
  } catch (error) {
    logger.error('Get complaint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
    });
  }
};

// Update complaint status (admin/officer)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolution } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    complaint.status = status;
    if (resolution) complaint.resolution = resolution;
    if (status === 'resolved') {
      complaint.resolutionDate = new Date();
    }

    await complaint.save();

    logger.info(`Complaint ${req.params.id} status updated to ${status}`);

    res.json({
      success: true,
      message: 'Complaint status updated',
      complaint,
    });
  } catch (error) {
    logger.error('Update complaint status error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint',
    });
  }
};

// Assign complaint to officer
const assignComplaint = async (req, res) => {
  try {
    const { officerId } = req.body;

    const officer = await User.findById(officerId);
    if (!officer || !['officer', 'admin'].includes(officer.role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid officer ID',
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo: officerId },
      { new: true }
    ).populate('assignedTo', 'name email');

    logger.info(`Complaint ${req.params.id} assigned to ${officer.email}`);

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      complaint,
    });
  } catch (error) {
    logger.error('Assign complaint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint',
    });
  }
};

// Upvote complaint
const upvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Complaint upvoted',
      complaint,
    });
  } catch (error) {
    logger.error('Upvote complaint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upvote complaint',
    });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaint,
  updateComplaintStatus,
  assignComplaint,
  upvoteComplaint,
};
