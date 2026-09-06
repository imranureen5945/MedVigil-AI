import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Search, Loader2, Pill, UserCheck, AlertCircle, RotateCcw, Sparkles
} from 'lucide-react';
import { familySafetyService, getApiErrorMessage } from '../../../services/familySafetyService';
import { medicineService } from '../../../services/medicineService';
import SafetyCheckResult from './SafetyCheckResult';

/**
 * Medication Safety Checker — the vault's core consumer flow.
 * A profile must be explicitly selected ("Check for: Myself / family member")
 * so a result is never silently attributed to the wrong person, and the
 * checked medicine can be picked from the directory or typed manually.
 * Smart search includes fuzzy matching, OCR correction and alternate
 * spellings — a likely match is offered instead of "Medicine Not Found".
 */
export default function SafetyChecker({ profiles = [], prefillMedicine = null, onResetPrefill = null }) {
  const [profileId, setProfileId] = useState('');
  const [medicineId, setMedicineId] = useState(null);
  const [medicineName, setMedicineName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [checkingFor, setCheckingFor] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  // Pre-filled medicine (e.g. "Check safety" pressed on a directory card)
  useEffect(() => {
    if (prefillMedicine) {
      setMedicineId(prefillMedicine.id || null);
      setMedicineName(prefillMedicine.name || '');
      setResult(null);
      setError('');
    }
  }, [prefillMedicine]);

  const runSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const meds = await medicineService.searchMedicines(value.trim());
      setSuggestions(Array.isArray(meds) ? meds.slice(0, 8) : []);
      setSearching(false);
    }, 350);
  };

  const handleNameChange = (value) => {
    setMedicineName(value);
    setMedicineId(null); // manual typing overrides a picked suggestion
    setResult(null);
    runSearch(value);
  };

  const pickSuggestion = (med) => {
    setMedicineId(med.id);
    setMedicineName(med.brandName);
    setSuggestions([]);
    setResult(null);
  };

  const handleCheck = async () => {
    setError('');
    if (!profileId) { setError('Select whose profile to check — Myself or a family member.'); return; }
    if (!medicineName.trim()) { setError('Enter or select a medicine to check.'); return; }

    const profile = profiles.find((p) => String(p.id) === String(profileId));
    setChecking(true);
    setResult(null);
    try {
      const response = await familySafetyService.checkMedicineSafety({
        profileId: Number(profileId),
        medicineId: medicineId || null,
        medicineName: medicineName.trim()
      });
      setCheckingFor(response.checkingFor || profile?.name || '');
      setResult(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'The safety check could not be completed. Please try again.'));
    } finally {
      setChecking(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError('');
    setMedicineId(null);
    setMedicineName('');
    setSuggestions([]);
    if (onResetPrefill) onResetPrefill();
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition';

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-teal-700" />
          <h3 className="font-extrabold text-base text-slate-900">Medication Safety Checker</h3>
        </div>

        {profiles.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>Create a safety profile first — checks always run against a selected person's recorded information.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Profile selection — never defaulted, per spec */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Check for <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {profiles.map((p) => {
                  const active = String(p.id) === String(profileId);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setProfileId(p.id); setResult(null); }}
                      className={`px-4 py-3 rounded-2xl border text-left transition ${
                        active
                          ? 'bg-teal-700 border-teal-700 text-white shadow-md shadow-teal-700/20'
                          : 'bg-white border-slate-200 hover:border-teal-400'
                      }`}
                    >
                      <div className={`text-sm font-bold truncate ${active ? 'text-white' : 'text-slate-800'}`}>{p.name}</div>
                      <div className={`text-[11px] font-semibold ${active ? 'text-teal-100' : 'text-slate-500'}`}>
                        {p.relation || 'Family'}
                        {p.age != null ? ` • ${p.age} yrs` : ''}
                      </div>
                      {active && p.snapshot && (
                        <div className="text-[10px] text-teal-100 font-bold mt-0.5">
                          {p.snapshot.allergyCount} allergies • {p.snapshot.medicationCount} medicines • {p.snapshot.conditionCount} conditions
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medicine input */}
            <div className="relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Medicine to check <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={medicineName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Search the medicine directory or type a name (e.g. Brufen)"
                  className={`${inputClass} pl-10`}
                />
                {searching && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 animate-spin" />}
              </div>
              {medicineId && (
                <p className="mt-1.5 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <Pill className="w-3 h-3" /> Selected from the medicine directory — standardized data will be used.
                </p>
              )}

              {suggestions.length > 0 && !medicineId && (
                <div className="absolute z-20 mt-1.5 w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                  {suggestions.some((s) => s._fuzzyScore != null) && (
                    <div className="px-4 py-2 bg-teal-50 border-b border-teal-100 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-teal-700" />
                      <span className="text-[10px] font-bold text-teal-800">
                        We found similar medicines — select the correct option below.
                      </span>
                    </div>
                  )}
                  {suggestions.map((med) => (
                    <button
                      key={med.id}
                      type="button"
                      onClick={() => pickSuggestion(med)}
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
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleCheck}
                disabled={checking}
                className="px-6 py-3 font-extrabold text-sm text-white bg-teal-700 hover:bg-teal-800 rounded-2xl shadow-lg shadow-teal-700/20 transition flex items-center gap-2 disabled:opacity-60"
              >
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {checking ? 'Checking...' : 'Run Safety Check'}
              </button>
              {(result || medicineName) && (
                <button
                  type="button"
                  onClick={reset}
                  className="px-4 py-3 font-bold text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {result && (
        <SafetyCheckResult result={result} checkingFor={checkingFor} />
      )}

      {!result && profileId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
          <UserCheck className="w-3.5 h-3.5" />
          <span>
            The result will be labelled with the selected profile's name, and the check runs only
            against that person's recorded information.
          </span>
        </motion.div>
      )}
    </div>
  );
}
