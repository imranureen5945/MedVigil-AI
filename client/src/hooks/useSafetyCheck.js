import { useState } from 'react';
import api from '../services/api';

/**
 * Hook to run immediate safety checks for medicines against a family member profile
 */
export function useSafetyCheck() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const checkMedicine = async (familyMemberId, medicine) => {
    setChecking(true);
    setError(null);
    try {
      const response = await api.post('/safety/check-single', {
        familyMemberId,
        medicine
      });
      const data = response.data?.data || response.data;
      setResult(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to perform safety check';
      setError(msg);
      throw err;
    } finally {
      setChecking(false);
    }
  };

  return { checkMedicine, checking, result, error };
}
