import api from './api';

export const doctorConnectService = {
  getDoctors: async () => {
    try {
      const response = await api.get('/messages/doctors');
      return response.data || [];
    } catch (e) {
      return [];
    }
  },
  sendMessage: async (data) => {
    const response = await api.post('/messages/send', data);
    return response.data;
  },
  getPatientMessages: async () => {
    try {
      const response = await api.get('/messages/patient');
      return response.data || [];
    } catch (e) {
      return [];
    }
  },
  getDoctorInbox: async () => {
    try {
      const response = await api.get('/messages/doctor');
      return response.data || [];
    } catch (e) {
      return [];
    }
  },
  replyMessage: async (id, data) => {
    const response = await api.put(`/messages/${id}/reply`, data);
    return response.data;
  },
  markSeen: async (id) => {
    try {
      const response = await api.put(`/messages/${id}/seen`);
      return response.data;
    } catch (e) {
      return null;
    }
  }
};
