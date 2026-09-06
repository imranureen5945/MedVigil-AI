import React from 'react';
import { BookOpen, Sparkles, ArrowRight, Languages } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JargonTranslatorCard({ translations }) {
  if (!translations || translations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-subtle space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
              2. Medical Abbreviation & Jargon Translator
            </span>
            <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight">
              Prescription Codes Explained
            </h3>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-400 hidden sm:inline-flex items-center gap-1">
          <Languages size={14} /> Bilingual Breakdown
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {translations.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 hover:bg-white transition-colors shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-900 font-mono font-black text-xs border border-indigo-200">
                  {item.code}
                </span>
                <span className="font-bold text-xs text-slate-800">
                  {item.meaning}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Latin Code</span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                <span className="text-[10px] font-extrabold text-blue-700 uppercase block mb-0.5">
                  English Plain Meaning:
                </span>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {item.plainEnglish}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-100">
                <span className="text-[10px] font-extrabold text-teal-800 uppercase block mb-0.5">
                  Roman Urdu (آسان اردو رہنمائی):
                </span>
                <p className="text-teal-950 font-bold leading-relaxed">
                  {item.romanUrdu}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
