import api from './api';

export const scanService = {
  analyzeImage: async ({ image, ocrText, familyMemberId }) => {
    const response = await api.post('/scan/analyze-image', { image, ocrText, familyMemberId });
    return response.data;
  },

  lookupMedicine: async (text, familyMemberId, image) => {
    const response = await api.post('/scan/lookup', { text, familyMemberId, image });
    return response.data;
  },

  saveScan: async (data) => {
    const response = await api.post('/scan/save', data);
    return response.data;
  },

  getScanHistory: async (familyMemberId) => {
    const response = await api.get(`/scan/history/${familyMemberId}`);
    return response.data || [];
  }
};
