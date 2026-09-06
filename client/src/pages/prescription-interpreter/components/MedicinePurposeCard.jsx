import React from 'react';
import { HelpCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MedicinePurposeCard({ purpose, medicineName }) {
  if (!purpose) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-50/80 via-emerald-50/40 to-white border border-teal-200/80 shadow-subtle flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black shadow-md shrink-0 mt-0.5">
        <HelpCircle className="w-5 h-5" />
      </div>

      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-800">
            3. Why was this prescribed?
          </span>
          <span className="text-[10px] font-bold text-slate-400">• Concise Patient Summary</span>
        </div>
        <p className="text-sm font-black text-slate-900 leading-snug">
          {purpose}
        </p>
        <p className="text-[11px] text-slate-500 font-medium pt-0.5">
          *Note: Strictly concise indication summary. For complete pharmacodynamics, refer to the Drug Directory.
        </p>
      </div>
    </motion.div>
  );
}
