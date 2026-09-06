import api from './api';

export const medicationService = {
  getMedications: async (familyMemberId, activeOnly = true) => {
    const response = await api.get(`/medications/${familyMemberId}?activeOnly=${activeOnly}`);
    return response.data?.data || response.data || [];
  },

  addMedication: async (data) => {
    const response = await api.post('/medications', data);
    return response.data;
  },

  updateMedication: async (id, data) => {
    const response = await api.put(`/medications/${id}`, data);
    return response.data;
  },

  deleteMedication: async (id) => {
    const response = await api.delete(`/medications/${id}`);
    return response.data;
  }
};
