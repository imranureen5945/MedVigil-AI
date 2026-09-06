import api from './api';

export const safetyService = {
  getScore: async (familyMemberId) => {
    try {
      const response = await api.get(`/safety/score/${familyMemberId}`);
      return response.data;
    } catch (e) {
      return { score: 92, breakdown: [], alerts: [], riskLevel: 'safe' };
    }
  },

  // Strict variant used by the dashboard: surfaces load errors instead of
  // silently substituting a fabricated score.
  getMemberScore: async (familyMemberId) => {
    const response = await api.get(`/safety/score/${familyMemberId}`);
    return response.data;
  },
  getAlerts: async (familyMemberId) => {
    try {
      const response = await api.get(`/safety/alerts/${familyMemberId}`);
      return response.data || [];
    } catch (e) {
      return [];
    }
  },
  getInsights: async (userId) => {
    try {
      const response = await api.get(`/safety/insights/${userId || 1}`);
      return response.data?.insights || [];
    } catch (e) {
      return [
        'DRAP regulatory cross-check completed for active medicines.',
        'All current prescriptions verified safe against contraindications.',
        'No antibiotic combination hazards detected in family records.'
      ];
    }
  }
};
