import api from './api';

export const settingsService = {
  getSettings: async () => {
    return await api.get('/settings');
  },

  updateSettings: async (settingsData) => {
    return await api.put('/settings', settingsData);
  },

  uploadLogo: async (formData) => {
    return await api.post('/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};
