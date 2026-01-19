const mongoose = require('mongoose');
const config = require('../config/env');

// ─────────────────────────────────────────────────────────────
// Category → Department mapping
// ─────────────────────────────────────────────────────────────
const CATEGORY_TO_DEPT = {
  garbage: 'garbage',
  pothole: 'potholes',
  potholes: 'potholes',
  fallen_trees: 'fallen_trees',
  electric_poles: 'electric_poles',
  electricity: 'electric_poles',
  default: 'misc',
};

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
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
      enum: [...config.COMPLAINT_CATEGORIES, ...config.DEPARTMENTS],
      required: [true, 'Category is required'],
    },
    // Auto-derived from category for role-based filtering
    department: {
      type: String,
      enum: config.DEPARTMENTS,
      index: true,
    },
    categoryConfidence: {
      type: Number,
      default: 0,
    },
    severity: {
      type: String,
      enum: config.SEVERITY_LEVELS,
      default: 'medium',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imageMLPrediction: {
      type: String,
      default: null,
    },
    imageMLConfidence: {
      type: Number,
      default: 0,
    },
    location: {
      type: { type: String, enum: ['Point'] },
      coordinates: { type: [Number] },
    },
    status: {
      type: String,
      enum: config.COMPLAINT_STATUS,
      default: 'open',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolution: {
      type: String,
      default: null,
    },
    resolutionDate: {
      type: Date,
      default: null,
      index: true,
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
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────────────────────
// PRE-SAVE: Auto-map category → department
// ─────────────────────────────────────────────────────────────
complaintSchema.pre('save', function (next) {
  if (this.isModified('category') || !this.department) {
    this.department = CATEGORY_TO_DEPT[this.category] || CATEGORY_TO_DEPT.default;
  }
  // Sync priority with severity if not set
  if (!this.priority) this.priority = this.severity;
  next();
});

// ─────────────────────────────────────────────────────────────
// INDEXES: Optimized for analytics + role-based queries
// ─────────────────────────────────────────────────────────────
complaintSchema.index({ location: '2dsphere' });                    // Geospatial (heatmap, nearby)
complaintSchema.index({ department: 1, status: 1, createdAt: -1 }); // Admin dept queries
complaintSchema.index({ department: 1, createdAt: -1 });            // Monthly trends by dept
complaintSchema.index({ status: 1, resolutionDate: 1 });            // Resolution analytics
complaintSchema.index({ ward: 1, category: 1, createdAt: -1 });     // Ward analytics
complaintSchema.index({ userId: 1, createdAt: -1 });                // Citizen's complaints
complaintSchema.index({ createdAt: -1 });                           // Global timeline

module.exports = mongoose.model('Complaint', complaintSchema);
