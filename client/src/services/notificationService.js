import api from './api';

export const notificationService = {
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data || [];
    } catch (e) {
      return [];
    }
  },
  markRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (e) {
      return null;
    }
  },
  markAllRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (e) {
      return null;
    }
  }
};
