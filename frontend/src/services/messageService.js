import api from './api';

export const messageService = {
  getContacts: async () => {
    return await api.get('/messages/contacts');
  },

  getUnreadCount: async () => {
    return await api.get('/messages/unread-count');
  },

  getMessages: async (partnerId) => {
    return await api.get(`/messages/${partnerId}`);
  },

  sendMessage: async (data) => {
    return await api.post('/messages', data);
  },
};
