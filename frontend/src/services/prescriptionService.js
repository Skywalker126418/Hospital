import api from './api';

export const prescriptionService = {
  getPrescriptions: async (params = {}) => {
    return await api.get('/prescriptions', { params });
  },

  getPrescriptionById: async (id) => {
    return await api.get(`/prescriptions/${id}`);
  },

  createPrescription: async (data) => {
    return await api.post('/prescriptions', data);
  },
};
