import api from './api';

export const prescriptionService = {
  /**
   * Decodes handwritten prescription or medicine instruction text via Gemini AI
   */
  interpretPrescription: async ({ image, ocrText }) => {
    const response = await api.post('/prescription/interpret', { image, ocrText });
    return response.data;
  },

  /**
   * Fetches dictionary of medical abbreviations (OD, BD, TDS, SOS, AC, PC, HS, etc.)
   */
  getAbbreviations: async () => {
    const response = await api.get('/prescription/abbreviations');
    return response.data?.data || response.data || [];
  }
};
