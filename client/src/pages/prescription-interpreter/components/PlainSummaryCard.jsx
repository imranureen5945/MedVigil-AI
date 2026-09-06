import React, { useState } from 'react';
import { FileText, Languages, Sparkles, Volume2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlainSummaryCard({ summary }) {
  const [lang, setLang] = useState('en'); // 'en' or 'ur'
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const currentText = lang === 'en' ? summary.english : summary.romanUrdu;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-subtle space-y-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-700 text-white flex items-center justify-center font-black shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 block">
              5. Plain Language Prescription Summary
            </span>
            <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight">
              Patient Explanation
            </h3>
          </div>
        </div>

        {/* English / Roman Urdu Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-end sm:self-auto">
          <button
            onClick={() => setLang('en')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              lang === 'en'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang('ur')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              lang === 'ur'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Roman Urdu (رومن اردو)
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/60 via-indigo-50/40 to-slate-50 border border-purple-100 space-y-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={lang}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`text-sm sm:text-base font-bold leading-relaxed ${
              lang === 'ur' ? 'text-purple-950 font-black' : 'text-slate-800'
            }`}
          >
            {currentText}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-2 border-t border-purple-200/50 text-xs">
          <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
            <Sparkles size={13} className="text-purple-600" />
            {lang === 'en' ? 'Generated in clear patient terms' : 'آسان عام فہم رومن اردو میں ترجمہ شدہ'}
          </span>

          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-white hover:bg-purple-100/60 text-purple-700 border border-purple-200 rounded-xl font-bold transition flex items-center gap-1.5"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
