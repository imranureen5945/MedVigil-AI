import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldAlert, Loader2 } from 'lucide-react';
import { familySafetyService, getApiErrorMessage } from '../../../services/familySafetyService';
import AllergyPicker from './AllergyPicker';

/**
 * Record allergies on an existing profile (bulk). The server reports
 * duplicates instead of silently skipping them, so the message is surfaced
 * to the user rather than swallowed.
 */
export default function AddAllergyModal({ profileId, profileName, onClose, onAdded }) {
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (selected.length === 0) { setError('Record at least one allergy.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const response = await familySafetyService.addAllergies(
        profileId,
        selected.map(({ allergen, allergyType, severity }) => ({ allergen, allergyType, severity }))
      );
      onAdded(response);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'The allergies could not be recorded. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden border border-slate-100 flex flex-col"
      >
        <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-700" />
            <h2 className="font-extrabold text-base text-slate-900">Record Allergies</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-500">
            Recording for <strong className="text-slate-700">{profileName}</strong>. Search the medicine directory
            or enter any allergen manually — nothing is ever assumed.
          </p>
          <AllergyPicker selected={selected} onChange={setSelected} />
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-700">{error}</div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/60">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 font-bold text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || selected.length === 0}
            className="px-6 py-2.5 font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md shadow-teal-700/20 transition flex items-center gap-1.5 disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? 'Recording...' : `Record ${selected.length || ''} Allerg${selected.length === 1 ? 'y' : 'ies'}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
