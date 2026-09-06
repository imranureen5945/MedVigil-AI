import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  Activity,
  ShieldCheck,
  UserPlus,
  ArrowRight,
} from 'lucide-react';

const TONE_STYLES = {
  danger: {
    icon: AlertOctagon,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50 border-red-200',
    stripe: 'bg-red-500',
    title: 'text-red-700',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200',
    stripe: 'bg-amber-500',
    title: 'text-amber-700',
  },
  caution: {
    icon: Activity,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50 border-teal-200',
    stripe: 'bg-teal-500',
    title: 'text-teal-700',
  },
  safe: {
    icon: ShieldCheck,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200',
    stripe: 'bg-emerald-500',
    title: 'text-emerald-700',
  },
  empty: {
    icon: UserPlus,
    iconColor: 'text-slate-500',
    iconBg: 'bg-slate-100 border-slate-200',
    stripe: 'bg-slate-400',
    title: 'text-slate-700',
  },
};

/**
 * Smart Safety Insight — ONE prioritized, actionable statement derived from
 * the household's real safety-engine results (see dashboardSafety.js).
 * "View Details" navigates to the existing relevant page instead of
 * duplicating the details on the dashboard.
 */
export default function SmartInsightCard({ insight, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="glass-card p-6 sm:p-7 animate-pulse flex items-center gap-5">
        <div className="w-13 h-13 rounded-2xl bg-slate-200" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-2/3" />
        </div>
      </div>
    );
  }
  if (!insight) return null;

  const style = TONE_STYLES[insight.tone] || TONE_STYLES.caution;
  const Icon = style.icon;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative overflow-hidden glass-card p-6 sm:p-7 shadow-subtle hover:shadow-elevated transition-all duration-300"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.stripe}`} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pl-2">
        <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-sm ${style.iconBg}`}>
          <Icon className={`w-6 h-6 ${style.iconColor}`} />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sea-green" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Smart Safety Insight
            </span>
          </div>
          <h3 className={`text-base sm:text-lg font-black leading-snug ${style.title}`}>
            {insight.title}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            {insight.message}
          </p>
        </div>

        {insight.action && (
          <button
            onClick={() => navigate(insight.action)}
            className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md self-stretch sm:self-center whitespace-nowrap"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
