import api from './api';

export const billingService = {
  getBills: async (params = {}) => {
    return await api.get('/billing', { params });
  },

  getBillById: async (id) => {
    return await api.get(`/billing/${id}`);
  },

  createBill: async (data) => {
    return await api.post('/billing', data);
  },

  recordPayment: async (id, data) => {
    return await api.post(`/billing/${id}/payments`, data);
  },
};
