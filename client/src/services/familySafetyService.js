import api from './api';

/**
 * Family Safety Vault — the central patient safety data layer.
 * Every endpoint verifies on the server that the profile belongs to the
 * signed-in user, so one family's safety data is never exposed to another.
 */
export const familySafetyService = {
  // Profile cards with safety snapshot (allergy/medication/condition counts) + top flags
  getProfiles: async () => {
    const response = await api.get('/family/profiles');
    return response.data.data || [];
  },

  // Full safety overview for one profile (profile, allergies, medications,
  // conditions, specialConsiderations, snapshot, flags, lastUpdated)
  getProfileOverview: async (profileId) => {
    const response = await api.get(`/family/profiles/${profileId}`);
    return response.data.data;
  },

  // Create a profile — basic info plus optional conditions[] / allergies[]
  // from the wizard. Returns { message, data: overview, skipped }
  createProfile: async (payload) => {
    const response = await api.post('/family/profiles', payload);
    return response.data;
  },

  // Partial update (only sent fields change). Returns { message, data: overview }
  updateProfile: async (profileId, payload) => {
    const response = await api.patch(`/family/profiles/${profileId}`, payload);
    return response.data;
  },

  deleteProfile: async (profileId) => {
    const response = await api.delete(`/family/profiles/${profileId}`);
    return response.data;
  },

  // Add a current medicine. Accepts directory medicineId or a manually entered
  // medicineName. Returns { message, identified, data } — when identified is
  // false the medicine was stored but is NOT confidently matched, so the UI
  // must surface that message instead of implying the name was verified.
  addMedication: async (profileId, payload) => {
    const response = await api.post(`/family/profiles/${profileId}/medications`, payload);
    return response.data;
  },

  deleteMedication: async (profileId, medicationId) => {
    const response = await api.delete(`/family/profiles/${profileId}/medications/${medicationId}`);
    return response.data;
  },

  // Bulk-add allergies. Returns { message, data, duplicates, errors }
  addAllergies: async (profileId, allergies) => {
    const response = await api.post(`/family/profiles/${profileId}/allergies`, { allergies });
    return response.data;
  },

  deleteAllergy: async (profileId, allergyId) => {
    const response = await api.delete(`/family/profiles/${profileId}/allergies/${allergyId}`);
    return response.data;
  },

  // Bulk-add conditions. Returns { message, data, duplicates, errors }
  addConditions: async (profileId, conditions) => {
    const response = await api.post(`/family/profiles/${profileId}/conditions`, { conditions });
    return response.data;
  },

  deleteCondition: async (profileId, conditionId) => {
    const response = await api.delete(`/family/profiles/${profileId}/conditions/${conditionId}`);
    return response.data;
  },

  // Medication safety check against an explicitly selected profile.
  // Returns { success, checkingFor: profileName, data: engineResult } where
  // engineResult includes overallRisk LOW|MODERATE|HIGH|UNKNOWN and the
  // allergy/interaction/duplicate/condition/pregnancy/age alert lists.
  checkMedicineSafety: async ({ profileId, medicineId, medicineName }) => {
    const response = await api.post('/medication-safety/check', { profileId, medicineId, medicineName });
    return response.data;
  }
};

// Shared error-message extractor so failures are never silently swallowed
export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message || err?.message || fallback;
}
