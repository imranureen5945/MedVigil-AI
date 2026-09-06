import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { COMMON_CONDITIONS } from './severityStyles';

/**
 * Selectable health-condition chips (wizard step 2 and add-condition flow).
 * Selection is plain names — the server maps them onto canonical condition
 * keys for the deterministic safety engines. A custom entry is supported so
 * less common conditions are never forced into the wrong chip.
 */
export default function ConditionChips({ selected = [], onToggle }) {
  const [custom, setCustom] = useState('');
  const isSelected = (name) => selected.includes(name);

  const toggle = (name) => onToggle(name);

  const addCustom = () => {
    const value = custom.trim();
    if (value && !isSelected(value)) toggle(value);
    setCustom('');
  };

  const extraConditions = selected.filter((name) => !COMMON_CONDITIONS.includes(name));
  const allConditions = COMMON_CONDITIONS.concat(extraConditions);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {allConditions.map((condition) => {
          const active = isSelected(condition);
          return (
            <button
              key={condition}
              type="button"
              onClick={() => toggle(condition)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-bold border transition-all flex items-center gap-1.5 ${
                active
                  ? 'bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-700'
              }`}
            >
              {active ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {condition}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
          }}
          placeholder="Other condition (e.g. Epilepsy)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
}
