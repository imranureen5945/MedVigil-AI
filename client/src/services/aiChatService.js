import api from './api';

export const aiChatService = {
  analyzeMedicine: async (symptoms, language = 'en') => {
    const response = await api.post('/ai/analyze-medicine', { symptoms, language });
    return response.data?.data || response.data;
  },

  explainInteraction: async (drug1, drug2) => {
    const response = await api.post('/ai/explain-interaction', { drug1, drug2 });
    return response.data?.data || response.data;
  }
};
