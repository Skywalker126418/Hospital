import api from './api';

export const consultationService = {
  getConsultations: async (params = {}) => {
    return await api.get('/consultations', { params });
  },

  getConsultationById: async (id) => {
    return await api.get(`/consultations/${id}`);
  },

  createConsultation: async (data) => {
    return await api.post('/consultations', data);
  },
};
