import api from './api';

export const userService = {
  getUsers: async (params = {}) => {
    return await api.get('/users', { params });
  },

  createUser: async (userData) => {
    return await api.post('/users', userData);
  },

  toggleStatus: async (id) => {
    return await api.patch(`/users/${id}/toggle-status`);
  },

  resetPassword: async (id, newPassword) => {
    return await api.post(`/users/${id}/reset-password`, { newPassword });
  },
};
