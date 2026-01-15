const Complaint = require('../models/Complaint');
const config = require('../config/env');
const logger = require('../utils/logger');

const analyticsService = {
  // Get ward-wise complaint distribution (for heatmap)
  getWardHeatmap: async (startDate = null, endDate = null) => {
    try {
      const query = {};
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const heatmapData = await Complaint.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$ward',
            count: { $sum: 1 },
            avgSeverity: { $avg: { $cond: [{ $eq: ['$severity', 'critical'] }, 3, { $cond: [{ $eq: ['$severity', 'high'] }, 2, 1] }] } },
            categories: { $push: '$category' },
          },
        },
        { $sort: { count: -1 } },
      ]);

      return heatmapData.map((item) => ({
        ward: item._id,
        complaintCount: item.count,
        severity: item.avgSeverity,
        categories: [...new Set(item.categories)],
      }));
    } catch (error) {
      logger.error('Heatmap generation error:', error.message);
      throw error;
    }
  },

  // Get category-wise trends
  getCategoryTrends: async (months = 6) => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const trends = await Complaint.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              category: '$category',
              month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.month': -1 },
        },
      ]);

      // Format data for frontend charts
      const formattedTrends = {};
      trends.forEach((item) => {
        const category = item._id.category;
        if (!formattedTrends[category]) {
          formattedTrends[category] = [];
        }
        formattedTrends[category].push({
          month: item._id.month,
          count: item.count,
        });
      });

      return formattedTrends;
    } catch (error) {
      logger.error('Trend analysis error:', error.message);
      throw error;
    }
  },

  // Get complaint statistics
  getStatistics: async () => {
    try {
      const stats = await Complaint.aggregate([
        {
          $facet: {
            totalComplaints: [{ $count: 'count' }],
            byCategory: [
              { $group: { _id: '$category', count: { $sum: 1 } } },
            ],
            byStatus: [
              { $group: { _id: '$status', count: { $sum: 1 } } },
            ],
            bySeverity: [
              { $group: { _id: '$severity', count: { $sum: 1 } } },
            ],
            averageResolutionTime: [
              {
                $match: { status: 'resolved' },
              },
              {
                $project: {
                  resolutionTime: {
                    $subtract: ['$resolutionDate', '$createdAt'],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  avgTime: { $avg: '$resolutionTime' },
                },
              },
            ],
          },
        },
      ]);

      return stats[0];
    } catch (error) {
      logger.error('Statistics generation error:', error.message);
      throw error;
    }
  },

  // Get top wards by complaint count
  getTopWards: async (limit = 10) => {
    try {
      const topWards = await Complaint.aggregate([
        {
          $group: {
            _id: '$ward',
            complaintCount: { $sum: 1 },
            resolvedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0],
              },
            },
          },
        },
        { $sort: { complaintCount: -1 } },
        { $limit: limit },
        {
          $project: {
            ward: '$_id',
            complaintCount: 1,
            resolvedCount: 1,
            resolutionRate: {
              $multiply: [
                { $divide: ['$resolvedCount', '$complaintCount'] },
                100,
              ],
            },
            _id: 0,
          },
        },
      ]);

      return topWards;
    } catch (error) {
      logger.error('Top wards error:', error.message);
      throw error;
    }
  },

  // Get category distribution by ward
  getCategoryByWard: async (ward) => {
    try {
      const data = await Complaint.aggregate([
        { $match: { ward: parseInt(ward) } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      return data;
    } catch (error) {
      logger.error('Category by ward error:', error.message);
      throw error;
    }
  },
};

module.exports = analyticsService;
