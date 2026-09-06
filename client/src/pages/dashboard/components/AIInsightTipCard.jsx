import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';

/**
 * AI Safety Tip of the Day — the top-priority insight from the real safety
 * engine (GET /safety/insights/:userId). Replaces the old single SmartInsightCard.
 * Never fabricates content; shows nothing when no insights exist.
 */

const PRIORITY_STYLES = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    stripe: 'bg-red-500',
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    stripe: 'bg-amber-500',
  },
  low: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-700',
    badge: 'bg-teal-100 text-teal-700',
    stripe: 'bg-sea-green',
  },
};

export default function AIInsightTipCard({ insights, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
          </div>
        </div>
        <div className="h-3 bg-slate-200 rounded w-full mt-2" />
      </div>
    );
  }

  if (!insights || insights.length === 0) return null;

  const tip = insights[0];
  const style = PRIORITY_STYLES[tip.priority] || PRIORITY_STYLES.low;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-6 shadow-subtle hover:shadow-elevated transition-all duration-300 relative overflow-hidden"
    >
      {/* Accent gradient stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.stripe}`} />

      <div className="flex items-start gap-4 pl-2">
        <div className={`w-11 h-11 rounded-xl border ${style.bg} ${style.border} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          {tip.priority === 'high' ? (
            <Lightbulb className={`w-5 h-5 ${style.text}`} />
          ) : (
            <Sparkles className={`w-5 h-5 ${style.text}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              AI Safety Tip of the Day
            </span>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${style.badge}`}>
              {tip.priority}
            </span>
          </div>

          <h4 className={`text-sm sm:text-base font-black leading-snug ${style.text}`}>
            {tip.title}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
            {tip.message}
          </p>
        </div>

        {tip.action && (
          <button
            onClick={() => navigate(tip.action)}
            className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all shadow-sm hover:shadow-md self-center whitespace-nowrap flex-shrink-0"
          >
            Details
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
