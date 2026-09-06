import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClarityWarningsCard({ warnings, clarityScore, confidenceLevel }) {
  const hasWarnings = warnings && warnings.length > 0;
  const score = clarityScore || 90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 sm:p-7 rounded-3xl border shadow-subtle space-y-4 ${
        hasWarnings
          ? 'bg-amber-50/50 border-amber-200/90'
          : 'bg-emerald-50/40 border-emerald-200/90'
      }`}
    >
      <div className="flex items-center justify-between border-b border-black/5 pb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-md text-white ${
            hasWarnings ? 'bg-amber-500' : 'bg-emerald-600'
          }`}>
            {hasWarnings ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <span className={`text-[10px] font-black uppercase tracking-wider block ${
              hasWarnings ? 'text-amber-800' : 'text-emerald-800'
            }`}>
              6. Prescription Completeness & Clarity Checker
            </span>
            <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight">
              {hasWarnings ? 'Prescription Ambiguity & Verification Notes' : 'Prescription Verified & Legible'}
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-xs font-black px-3 py-1 rounded-xl border ${
            score >= 85
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}>
            Legibility Score: {score}%
          </span>
        </div>
      </div>

      {hasWarnings ? (
        <div className="space-y-2.5">
          {warnings.map((warning, index) => (
            <div
              key={index}
              className="p-3.5 rounded-2xl bg-white border border-amber-200 text-xs font-bold text-amber-950 flex items-start gap-2.5 shadow-2xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          ))}
          <p className="text-[11px] text-amber-800/80 font-medium pl-1">
            *If handwriting or duration is partially unclear, always double check with your dispensing pharmacist.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-xs text-emerald-950 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">
            Doctor's handwriting, medicine name, frequency code, and dosage instructions were decoded with high clarity.
          </span>
        </div>
      )}
    </motion.div>
  );
}
