import React from 'react';
import { Pill, Clock, Calendar, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExtractedPrescriptionCard({ prescription }) {
  if (!prescription) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-subtle space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sea-green to-teal-700 text-white flex items-center justify-center font-black shadow-md">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sea-green block">
              1. Decoded Prescription Data
            </span>
            <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight">
              {prescription.medicineName || prescription.brandName}
            </h3>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-sea-green border border-teal-200 rounded-xl">
          {prescription.strength || 'Standard Dose'}
        </span>
      </div>

      {/* Grid of Key Prescription Elements */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
            Prescribed Dosage
          </span>
          <span className="font-black text-slate-800 text-xs sm:text-sm block">
            {prescription.dosage || '1 Tablet'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
            Frequency
          </span>
          <span className="font-black text-sea-green text-xs sm:text-sm block">
            {prescription.frequency} ({prescription.frequencyDecoded})
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
            Course Duration
          </span>
          <span className="font-black text-slate-800 text-xs sm:text-sm block">
            {prescription.duration || '5 Days'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
            Meal Timing
          </span>
          <span className="font-black text-slate-800 text-xs sm:text-sm block truncate">
            {prescription.timing || 'After meals'}
          </span>
        </div>
      </div>

      {prescription.additionalNotes && (
        <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 text-xs text-slate-600 flex items-center gap-2 font-medium">
          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Doctor's Special Note: <strong className="text-slate-800">{prescription.additionalNotes}</strong></span>
        </div>
      )}
    </motion.div>
  );
}
