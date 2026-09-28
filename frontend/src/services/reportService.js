import api from './api';

export const reportService = {
  getDashboardSummary: async () => {
    return await api.get('/reports/dashboard');
  },

  getReports: async (params = {}) => {
    return await api.get('/reports', { params });
  },
};
