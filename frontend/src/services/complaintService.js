import api from './api';

export const complaintService = {
  // Citizen
  create: (data) => api.post('/complaints/create', data),
  getMy: (params) => api.get('/complaints/my', { params }),
  upvote: (id) => api.put(`/complaints/${id}/upvote`),
  
  // Admin/Chief
  getAll: (params) => api.get('/complaints/all', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  assign: (id, userId) => api.put(`/complaints/${id}/assign`, { userId }),
};

export default complaintService;