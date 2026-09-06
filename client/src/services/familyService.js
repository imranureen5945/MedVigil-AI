import api from './api';

export const familyService = {
  getMembers: async () => {
    try {
      const response = await api.get('/family/members');
      return response.data || [];
    } catch (e) {
      return [];
    }
  },

  // Strict variant for the dashboard: distinguishes "no profiles yet" from a
  // load failure so the right empty/error state can be shown.
  getMembersStrict: async () => {
    const response = await api.get('/family/members');
    return response.data || [];
  },
  addMember: async (data) => {
    const response = await api.post('/family/members', data);
    return response.data;
  },
  updateMember: async (id, data) => {
    const response = await api.put(`/family/members/${id}`, data);
    return response.data;
  },
  deleteMember: async (id) => {
    const response = await api.delete(`/family/members/${id}`);
    return response.data;
  },
  activateMember: async (id) => {
    try {
      const response = await api.put(`/family/members/${id}/activate`);
      return response.data;
    } catch (e) {
      return null;
    }
  }
};
