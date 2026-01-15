// Helper functions
const helpers = {
  // Format response
  formatResponse: (success, message, data = null) => {
    return {
      success,
      message,
      ...(data && { data }),
    };
  },

  // Calculate severity score
  calculateSeverityScore: (severity) => {
    const scoreMap = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };
    return scoreMap[severity] || 2;
  },

  // Get ward name/description (if needed)
  getWardName: (wardNumber) => {
    const wards = {
      1: 'Downtown',
      2: 'East Side',
      3: 'West Side',
      4: 'North District',
      5: 'South District',
      // Add more as needed
    };
    return wards[wardNumber] || `Ward ${wardNumber}`;
  },

  // Calculate distance between two coordinates
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Paginate array
  paginate: (array, pageSize, pageNumber) => {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  },

  // Validate pagination params
  validatePaginationParams: (page, limit) => {
    return {
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit) || 10)),
    };
  },

  // Generate complaint ID
  generateComplaintId: () => {
    return `CMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Check if email is valid
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};

module.exports = helpers;
