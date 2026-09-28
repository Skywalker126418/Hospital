import api from './api';

export const laboratoryService = {
  getTests: async (params = {}) => {
    return await api.get('/laboratory', { params });
  },

  getTestById: async (id) => {
    return await api.get(`/laboratory/${id}`);
  },

  createTest: async (data) => {
    return await api.post('/laboratory', data);
  },

  updateResult: async (id, data) => {
    return await api.patch(`/laboratory/${id}/result`, data);
  },
};
