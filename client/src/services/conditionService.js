import api from './api';

export const conditionService = {
  getConditions: async (familyMemberId) => {
    const response = await api.get(`/conditions/${familyMemberId}`);
    return response.data?.data || response.data || [];
  },

  addCondition: async (data) => {
    const response = await api.post('/conditions', data);
    return response.data;
  },

  updateCondition: async (id, data) => {
    const response = await api.put(`/conditions/${id}`, data);
    return response.data;
  },

  deleteCondition: async (id) => {
    const response = await api.delete(`/conditions/${id}`);
    return response.data;
  }
};
