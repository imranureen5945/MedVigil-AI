import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, HeartPulse, Loader2 } from 'lucide-react';
import { familySafetyService, getApiErrorMessage } from '../../../services/familySafetyService';
import ConditionChips from './ConditionChips';
import { SEVERITY_OPTIONS } from './severityStyles';

/**
 * Record health conditions on an existing profile. Conditions map to
 * deterministic server-side rules (e.g. kidney disease → NSAID cautions),
 * so every recorded condition strengthens future medicine checks.
 */
export default function AddConditionModal({ profileId, profileName, onClose, onAdded }) {
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState('moderate');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleCondition = (conditionName) => {
    setSelected((prev) =>
      prev.includes(conditionName)
        ? prev.filter((c) => c !== conditionName)
        : [...prev, conditionName]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) { setError('Select at least one condition.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const response = await familySafetyService.addConditions(
        profileId,
        selected.map((conditionName) => ({ conditionName, severity }))
      );
      onAdded(response);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'The conditions could not be recorded. Please try again.'));
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
            <HeartPulse className="w-5 h-5 text-teal-700" />
            <h2 className="font-extrabold text-base text-slate-900">Record Health Conditions</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-500">
            Recording for <strong className="text-slate-700">{profileName}</strong>.
            These power condition-specific medicine cautions automatically.
          </p>

          <ConditionChips selected={selected} onToggle={toggleCondition} />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Severity (applies to all selected)
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

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
            {submitting ? 'Recording...' : `Record ${selected.length || ''} Condition${selected.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
