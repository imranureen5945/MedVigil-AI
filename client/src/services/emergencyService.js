import api from './api';

export const emergencyService = {
  getEmergencyInfo: async (familyMemberId) => {
    try {
      const response = await api.get(`/emergency/${familyMemberId}`);
      return response.data;
    } catch (e) {
      return null;
    }
  },
  saveEmergencyInfo: async (familyMemberId, data) => {
    const response = await api.put(`/emergency/${familyMemberId}`, data);
    return response.data;
  }
};
