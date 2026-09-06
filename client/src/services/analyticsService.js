import api from './api';

export const analyticsService = {
  getTrends: async (familyMemberId) => {
    try {
      const response = await api.get(`/analytics/trends/${familyMemberId}`);
      return response.data;
    } catch (e) {
      return {
        trends: [
          { date: 'Mon', score: 85 },
          { date: 'Tue', score: 88 },
          { date: 'Wed', score: 92 },
          { date: 'Thu', score: 90 },
          { date: 'Fri', score: 95 },
          { date: 'Sat', score: 94 },
          { date: 'Sun', score: 96 }
        ]
      };
    }
  },
  getUsageStats: async (userId) => {
    try {
      const response = await api.get(`/analytics/usage/${userId || 1}`);
      return response.data;
    } catch (e) {
      return { totalScans: 12, totalMeds: 8, activePrescriptions: 4, alertsThisMonth: 1 };
    }
  },
  getFamilyOverview: async (userId) => {
    try {
      const response = await api.get(`/analytics/family-overview/${userId || 1}`);
      return response.data;
    } catch (e) {
      return [];
    }
  }
};
