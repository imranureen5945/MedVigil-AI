import api from './api';

export const medicineService = {
  getAllMedicines: async () => {
    try {
      const response = await api.get('/medicines');
      return response.data;
    } catch (e) {
      return [];
    }
  },
  searchMedicines: async (query) => {
    try {
      const response = await api.get(`/medicines/search?q=${encodeURIComponent(query || '')}`);
      return response.data;
    } catch (e) {
      return [];
    }
  },
  getMedicine: async (id) => {
    try {
      const response = await api.get(`/medicines/${id}`);
      return response.data;
    } catch (e) {
      return null;
    }
  },
  checkInteractions: async (id) => {
    try {
      const response = await api.get(`/medicines/${id}/interactions`);
      return response.data;
    } catch (e) {
      return [];
    }
  },
  getRecalls: async () => {
    try {
      const response = await api.get('/medicines/recalls');
      return response.data;
    } catch (e) {
      return [];
    }
  }
};
