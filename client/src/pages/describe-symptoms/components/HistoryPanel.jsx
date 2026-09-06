import { ClipboardList, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatters } from '../../../utils/formatters';
import { getTriageRiskStyle } from './triageRiskStyles';

export default function HistoryPanel({ history, loading, onDelete }) {
  if (loading && history.length === 0) {
    return (
      <div className="bg-white/95 rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading assessment history...</p>
      </div>
    );
  }

  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-teal-700" />
          Assessment History
        </h4>
        <span className="text-[11px] text-slate-400 font-bold">{history.length} saved</span>
      </div>

      <div className="space-y-2.5">
        {history.map((entry) => {
          const risk = getTriageRiskStyle(entry.riskLevel);
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition"
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${risk.dot}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-xs font-black text-slate-800">{entry.riskLevel}</span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {entry.profileName ? `${entry.profileName} (${entry.profileRelation || '—'})` : 'Unknown profile'}
                    {' • '}{formatters.formatDate(entry.createdAt)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {formatters.truncate(entry.symptoms, 70)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {entry.amrAlert && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 border border-orange-300">
                    ANTIBIOTIC
                  </span>
                )}
                {entry.safetyOverride && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                    VERIFIED
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  title="Delete this assessment"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
