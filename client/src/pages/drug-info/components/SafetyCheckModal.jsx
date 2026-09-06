import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { familySafetyService } from '../../../services/familySafetyService';
import SafetyChecker from '../../family-profile/components/SafetyChecker';

/**
 * Medication safety check launched from a medicine directory card.
 * The medicine is pre-filled, but the profile must still be explicitly
 * selected — the result is always labelled "Checking safety for: [PROFILE NAME]"
 * so it can never be mistaken for another person's check.
 */
export default function SafetyCheckModal({ medicine, onClose }) {
  const [profiles, setProfiles] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    familySafetyService.getProfiles()
      .then((data) => { if (!cancelled) setProfiles(data); })
      .catch(() => {
        if (!cancelled) {
          setProfiles([]);
          setLoadError('Safety profiles could not be loaded. Please try again from the Family Safety Vault.');
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden border border-slate-100 flex flex-col"
      >
        <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-5 h-5 text-teal-700 flex-shrink-0" />
            <h2 className="font-extrabold text-base text-slate-900 truncate">
              Check Safety: {medicine.brandName || medicine.name}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {profiles === null ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-7 h-7 text-teal-700 animate-spin" />
            </div>
          ) : loadError ? (
            <p className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-700">{loadError}</p>
          ) : (
            <SafetyChecker
              profiles={profiles}
              prefillMedicine={{ id: medicine.id, name: medicine.brandName || medicine.name }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
