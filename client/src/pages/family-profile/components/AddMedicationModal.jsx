import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Pill, Search, Loader2, AlertTriangle, Check, Keyboard,
  BadgeCheck, ShieldQuestion, Sparkles
} from 'lucide-react';
import { familySafetyService, getApiErrorMessage } from '../../../services/familySafetyService';
import { medicineService } from '../../../services/medicineService';

/**
 * Add a current medicine to a profile.
 * Preferred flow: pick from the medicine directory so standardized data is
 * stored. Smart search includes fuzzy matching, OCR correction and alternate
 * spellings, so likely matches are offered instead of "Medicine Not Found".
 * Manual entry remains available for medicines truly not in the directory —
 * the server records it as a custom medicine and the UI must clearly show it
 * was not confidently identified (never imply verification that didn't happen).
 */
export default function AddMedicationModal({ profileId, profileName, onClose, onAdded }) {
  const [mode, setMode] = useState('directory'); // 'directory' | 'manual'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);

  const [medicineName, setMedicineName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [strength, setStrength] = useState('');
  const [frequency, setFrequency] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const runSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const meds = await medicineService.searchMedicines(value.trim());
      setResults(Array.isArray(meds) ? meds.slice(0, 8) : []);
      setSearching(false);
    }, 350);
  };

  const pickMedicine = (med) => {
    setSelectedMed(med);
    setQuery(med.brandName);
    setResults([]);
  };

  const handleSubmit = async () => {
    setError('');
    if (mode === 'directory' && !selectedMed) {
      setError('Select a medicine from the directory, or switch to manual entry.');
      return;
    }
    if (mode === 'manual' && !medicineName.trim()) {
      setError('Enter the medicine name.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = mode === 'directory'
        ? {
            medicineId: selectedMed.id,
            strength: strength.trim() || null,
            frequency: frequency.trim() || null,
            reason: reason.trim() || null,
            startDate: startDate || null
          }
        : {
            medicineName: medicineName.trim(),
            activeIngredient: activeIngredient.trim() || null,
            strength: strength.trim() || null,
            frequency: frequency.trim() || null,
            reason: reason.trim() || null,
            startDate: startDate || null
          };

      const response = await familySafetyService.addMedication(profileId, payload);
      onAdded(response); // { message, identified, data }
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'The medicine could not be added. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5';

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
            <Pill className="w-5 h-5 text-teal-700" />
            <h2 className="font-extrabold text-base text-slate-900">Add Current Medicine</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-500">
            Adding to <strong className="text-slate-700">{profileName}</strong>'s current medicines. Dosage details are recorded as reported — MedVigil does not recommend doses.
          </p>

          {/* Mode toggle */}
          <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
            <button
              type="button"
              onClick={() => { setMode('directory'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'directory' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5" /> From Directory
            </button>
            <button
              type="button"
              onClick={() => { setMode('manual'); setSelectedMed(null); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'manual' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" /> Manual Entry
            </button>
          </div>

          {mode === 'directory' ? (
            <div className="relative">
              <label className={labelClass}>Search Medicine Directory *</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedMed(null); runSearch(e.target.value); }}
                  placeholder="e.g. Panadol, Glucophage, Brufen"
                  className={`${inputClass} pl-10`}
                />
                {searching && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 animate-spin" />}
              </div>

              {selectedMed && (
                <div className="mt-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-emerald-900">{selectedMed.brandName}</div>
                    <div className="text-[11px] text-emerald-700">
                      {selectedMed.genericName}
                      {selectedMed.manufacturer ? ` • ${selectedMed.manufacturer}` : ''}
                      {selectedMed.category ? ` • ${selectedMed.category}` : ''}
                    </div>
                  </div>
                </div>
              )}

              {results.length > 0 && !selectedMed && (
                <div className="absolute z-20 mt-1.5 w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                  {results.some((r) => r._fuzzyScore != null) && (
                    <div className="px-4 py-2 bg-teal-50 border-b border-teal-100 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-teal-700" />
                      <span className="text-[10px] font-bold text-teal-800">
                        Possible match found — please confirm.
                      </span>
                    </div>
                  )}
                  {results.map((med) => (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => pickMedicine(med)}
                      className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-slate-800 truncate">{med.brandName}</div>
                        {med._fuzzyScore != null && (
                          <span className="flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200">
                            MATCH {Math.round(med._fuzzyScore * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {med.genericName}{med.manufacturer ? ` • ${med.manufacturer}` : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query.trim().length >= 2 && results.length === 0 && !searching && !selectedMed && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800 flex items-start gap-2">
                  <ShieldQuestion className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>No similar medicine found in the directory. Switch to <strong>Manual Entry</strong> to record it — it will be clearly marked as not verified against the directory.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Medicine Name *</label>
                <input type="text" value={medicineName} onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="As printed on the pack" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Active Ingredient (if known)</label>
                <input type="text" value={activeIngredient} onChange={(e) => setActiveIngredient(e.target.value)}
                  placeholder="e.g. Ibuprofen" className={inputClass} />
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-800">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>This entry will be stored as entered and flagged as not verified against the medicine directory. Please double-check the spelling.</span>
              </div>
            </div>
          )}

          {/* Profile-specific details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className={labelClass}>Strength (e.g. 500 mg)</label>
              <input type="text" value={strength} onChange={(e) => setStrength(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Frequency (e.g. Twice daily)</label>
              <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Reason / For</label>
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Blood pressure" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Start Date</label>
              <input type="date" value={startDate} max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
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
            disabled={submitting}
            className="px-6 py-2.5 font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md shadow-teal-700/20 transition flex items-center gap-1.5 disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? 'Adding...' : 'Add Medicine'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
