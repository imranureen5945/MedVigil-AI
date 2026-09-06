import React, { useEffect, useRef, useState } from 'react';
import { Search, X, AlertTriangle, Loader2, Pill, Apple, CircleDot } from 'lucide-react';
import { medicineService } from '../../../services/medicineService';
import { SEVERITY_OPTIONS } from './severityStyles';

const TYPE_ICONS = { medicine: Pill, food: Apple, other: CircleDot };
const TYPE_LABELS = { medicine: 'Medicine', food: 'Food', other: 'Other' };

/**
 * Allergy recorder (wizard step 3 and add-allergy flow).
 * Medicine allergies are searched against the national medicine directory on
 * the server — no medicine data is hardcoded in the frontend. Any allergen can
 * also be entered manually. Nothing is ever assumed: only what the user
 * explicitly records is stored.
 */
export default function AllergyPicker({ selected = [], onChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [customAllergen, setCustomAllergen] = useState('');
  const [customType, setCustomType] = useState('medicine');
  const debounceRef = useRef(null);
  const searchBoxRef = useRef(null);

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

  const hasAllergen = (allergen) =>
    selected.some((a) => a.allergen.toLowerCase() === allergen.toLowerCase());

  const addAllergy = (allergen, allergyType) => {
    if (!allergen.trim() || hasAllergen(allergen)) return;
    onChange([...selected, { allergen: allergen.trim(), allergyType, severity: 'moderate', notes: '' }]);
  };

  const updateEntry = (index, patch) => {
    const next = selected.map((entry, i) => (i === index ? { ...entry, ...patch } : entry));
    onChange(next);
  };

  const removeEntry = (index) => {
    const next = selected.filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Directory search */}
      <div className="relative" ref={searchBoxRef}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); runSearch(e.target.value); }}
            placeholder="Search a medicine allergy (e.g. Penicillin, Augmentin)..."
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
          />
          {searching && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 animate-spin" />
          )}
        </div>

        {query.trim().length >= 2 && (results.length > 0 || !searching) && (
          <div className="absolute z-20 mt-1.5 w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
            {results.length === 0 && !searching && (
              <div className="px-4 py-3 text-xs text-slate-500">
                No directory match. Use the manual entry below to record it anyway.
              </div>
            )}
            {results.map((med) => (
              <button
                key={med.id}
                type="button"
                onClick={() => {
                  addAllergy(med.brandName, 'medicine');
                  setQuery('');
                  setResults([]);
                }}
                disabled={hasAllergen(med.brandName)}
                className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition disabled:opacity-40 disabled:cursor-not-allowed border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Pill className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-800 truncate">{med.brandName}</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {med.genericName}{med.manufacturer ? ` • ${med.manufacturer}` : ''}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manual entry */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={customAllergen}
          onChange={(e) => setCustomAllergen(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addAllergy(customAllergen, customType);
              setCustomAllergen('');
            }
          }}
          placeholder="Or type any allergen (e.g. Aspirin, Peanuts, Latex)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
        />
        <select
          value={customType}
          onChange={(e) => setCustomType(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500 outline-none transition"
        >
          <option value="medicine">Medicine</option>
          <option value="food">Food</option>
          <option value="other">Other</option>
        </select>
        <button
          type="button"
          onClick={() => {
            addAllergy(customAllergen, customType);
            setCustomAllergen('');
          }}
          disabled={!customAllergen.trim()}
          className="px-5 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-bold hover:bg-teal-800 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Record Allergy
        </button>
      </div>

      {/* Recorded list */}
      {selected.length > 0 && (
        <div className="space-y-2">
          {selected.map((entry, index) => {
            const TypeIcon = TYPE_ICONS[entry.allergyType] || TYPE_ICONS.medicine;
            return (
              <div key={`${entry.allergen}-${index}`} className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  entry.allergyType === 'medicine' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <TypeIcon className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-800 truncate">{entry.allergen}</div>
                  <div className="text-[11px] text-slate-500">{TYPE_LABELS[entry.allergyType] || 'Medicine'} allergy</div>
                </div>
                <select
                  value={entry.severity}
                  onChange={(e) => updateEntry(index, { severity: e.target.value })}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                  title="Reaction severity"
                >
                  {SEVERITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  className="p-1.5 text-slate-300 hover:text-red-600 transition rounded-lg"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selected.length === 0 && (
        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
          <AlertTriangle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>
            No allergies recorded. If this person has none, continue — MedVigil will never
            assume an allergy from a medicine name; allergies are only checked from what you record here.
          </span>
        </div>
      )}
    </div>
  );
}
