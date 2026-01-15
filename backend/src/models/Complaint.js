const mongoose = require('mongoose');
const config = require('../config/env');

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    ward: {
      type: Number,
      required: [true, 'Ward number is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: config.COMPLAINT_CATEGORIES,
      required: [true, 'Category is required'],
    },
    categoryConfidence: {
      type: Number,
      default: 0, // ML model confidence score (0-1)
    },
    severity: {
      type: String,
      enum: config.SEVERITY_LEVELS,
      default: 'medium',
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imageMLPrediction: {
      type: String,
      default: null, // Prediction from image model
    },
    imageMLConfidence: {
      type: Number,
      default: 0,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: null,
      },
    },
    status: {
      type: String,
      enum: config.COMPLAINT_STATUS,
      default: 'open',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Officer/Admin assigned to this complaint
    },
    resolution: {
      type: String,
      default: null,
    },
    resolutionDate: {
      type: Date,
      default: null,
    },
    upvotes: {
      type: Number,
      default: 0, // Community engagement metric
    },
    comments: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // For faster sorting
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create index for location-based queries (for heatmaps)
complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ ward: 1, category: 1, createdAt: -1 });
complaintSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
