import api from './api';

export const allergyService = {
  getAllergies: async (familyMemberId) => {
    const response = await api.get(`/allergies/${familyMemberId}`);
    return response.data?.data || response.data || [];
  },

  addAllergy: async (data) => {
    const response = await api.post('/allergies', data);
    return response.data;
  },

  deleteAllergy: async (id) => {
    const response = await api.delete(`/allergies/${id}`);
    return response.data;
  }
};
