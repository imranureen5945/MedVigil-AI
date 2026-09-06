import api from './api';

/**
 * Self-Medication Risk Assessment API.
 *
 * Every call carries the selected Family Safety Vault profile — the server
 * re-verifies ownership on each endpoint, so one family's safety information
 * can never leak into another user's assessment.
 */
export const triageService = {
  // Steps 1+2 — normalize the described symptoms (English or Roman Urdu) and
  // receive the adaptive question set for the selected profile.
  startAssessment: async ({ familyMemberId, symptoms, language = 'en' }) => {
    const response = await api.post('/triage/start', {
      familyMemberId: Number(familyMemberId),
      symptoms,
      language
    });
    return response.data.data;
  },

  // Regenerate the adaptive questions when the symptom text is edited.
  getQuestions: async ({ familyMemberId, symptoms }) => {
    const response = await api.post('/triage/questions', {
      familyMemberId: Number(familyMemberId),
      symptoms
    });
    return response.data.data;
  },

  // Live check of the planned medicine against the selected profile's saved
  // safety information (verified allergy / interaction / condition findings
  // plus the antibiotic AMR alert) — powers the medicine picker step.
  medicationCheck: async ({ familyMemberId, medicineId = null, medicineName = null }) => {
    const response = await api.post('/triage/medication-check', {
      familyMemberId: Number(familyMemberId),
      ...(medicineId ? { medicineId: Number(medicineId) } : {}),
      ...(medicineName ? { medicineName } : {})
    });
    return response.data.data;
  },

  // Final assessment — deterministic safety rules, vault cross-checks and a
  // validated AI explanation that can only escalate, never lower, the result.
  assess: async ({ familyMemberId, symptoms, answers = {}, plannedMedicine = null, language = 'en' }) => {
    const response = await api.post('/triage/assess', {
      familyMemberId: Number(familyMemberId),
      symptoms,
      answers,
      plannedMedicine,
      language
    });
    return response.data.data;
  },

  // Assessment history for the signed-in user (all profiles, or one profile's).
  getHistory: async (familyMemberId = null) => {
    const query = familyMemberId ? `?familyMemberId=${Number(familyMemberId)}` : '';
    const response = await api.get(`/triage/history${query}`);
    return response.data.data || [];
  },

  deleteHistory: async (id) => {
    const response = await api.delete(`/triage/history/${id}`);
    return response.data;
  }
};
