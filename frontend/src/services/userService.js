import api from './api';

export const userService = {
  getUsers: async (params = {}) => {
    return await api.get('/users', { params });
  },

  createUser: async (userData) => {
    return await api.post('/users', userData);
  },

  updateUser: async (id, userData) => {
    return await api.put(`/users/${id}`, userData);
  },

  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`);
  },

  toggleStatus: async (id) => {
    return await api.patch(`/users/${id}/toggle-status`);
  },

  resetPassword: async (id, newPassword) => {
    return await api.post(`/users/${id}/reset-password`, { newPassword });
  },

  uploadProfileImage: async (formData, id) => {
    const url = id ? `/users/${id}/profile-image` : '/users/profile-image';
    return await api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteProfileImage: async (id) => {
    const url = id ? `/users/${id}/profile-image` : '/users/profile-image';
    return await api.delete(url);
  },
};
