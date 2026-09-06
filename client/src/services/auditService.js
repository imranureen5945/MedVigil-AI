import api from './api';

export const auditService = {
  getUserLogs: async (limit = 50) => {
    const response = await api.get(`/audit?limit=${limit}`);
    return response.data?.data || response.data || [];
  }
};
