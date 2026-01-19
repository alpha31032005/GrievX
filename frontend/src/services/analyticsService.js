import api from './api';

export const analyticsService = {
  // New endpoints
  getOverview: () => api.get('/analytics/overview'),
  getMonthly: (months = 6) => api.get('/analytics/monthly', { params: { months } }),
  getCategory: () => api.get('/analytics/category'),
  getResolution: () => api.get('/analytics/resolution'),
  getMap: () => api.get('/analytics/map'),
  
  // Legacy endpoints
  getStatistics: () => api.get('/analytics/statistics'),
  getHeatmap: () => api.get('/analytics/heatmap'),
  getCategoryTrends: () => api.get('/analytics/category-trends'),
  getTopWards: () => api.get('/analytics/top-wards'),
};

// Placeholder data for development (when API not available)
export const MOCK_DATA = {
  monthlyTrends: [
    { month: 'Jan', complaints: 220, resolved: 180 },
    { month: 'Feb', complaints: 280, resolved: 250 },
    { month: 'Mar', complaints: 300, resolved: 270 },
    { month: 'Apr', complaints: 260, resolved: 230 },
    { month: 'May', complaints: 320, resolved: 290 },
    { month: 'Jun', complaints: 350, resolved: 310 },
  ],
  categoryDistribution: [
    { name: 'Garbage', value: 35 },
    { name: 'Potholes', value: 28 },
    { name: 'Electric', value: 20 },
    { name: 'Trees', value: 12 },
    { name: 'Misc', value: 5 },
  ],
  resolutionTime: [
    { range: '<24h', count: 450 },
    { range: '1-3 days', count: 680 },
    { range: '3-7 days', count: 320 },
    { range: '>7 days', count: 150 },
  ],
};

export default analyticsService;