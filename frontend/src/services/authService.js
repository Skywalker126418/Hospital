import api from './api';

export const authService = {
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  googleLogin: async (googleData) => {
    return await api.post('/auth/google', googleData);
  },

  getProfile: async () => {
    return await api.get('/auth/me');
  },

  changePassword: async (passwords) => {
    return await api.post('/auth/change-password', passwords);
  },

  logout: () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('hms_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('hms_token');
  }
};
