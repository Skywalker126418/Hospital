import api from './api';

export const settingsService = {
  getSettings: async () => {
    return await api.get('/settings');
  },

  updateSettings: async (settingsData) => {
    return await api.put('/settings', settingsData);
  },
};
