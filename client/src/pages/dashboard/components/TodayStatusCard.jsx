import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, AlertTriangle, AlertOctagon, Rocket } from 'lucide-react';

const STATUS_STYLES = {
  safe: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
    title: 'text-emerald-700',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
    title: 'text-amber-700',
  },
  danger: {
    icon: AlertOctagon,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-50 border-red-200',
    dot: 'bg-red-500',
    title: 'text-red-700',
  },
  empty: {
    icon: Rocket,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50 border-teal-200',
    dot: 'bg-sea-green',
    title: 'text-teal-700',
  },
};

/**
 * Today — a compact current-state snapshot (one status line + one sentence).
 * Deliberately NOT an alert list; details live in Safety Center.
 */
export default function TodayStatusCard({ today, loading }) {
  if (loading) {
    return (
      <div className="glass-card p-5 sm:p-6 animate-pulse flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-200 rounded w-1/4" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    );
  }
  if (!today) return null;

  const style = STATUS_STYLES[today.tone] || STATUS_STYLES.safe;
  const Icon = style.icon;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-5 sm:p-6 shadow-subtle hover:shadow-elevated transition-all duration-300 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm ${style.iconBg}`}>
        <Icon className={`w-5 h-5 ${style.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Today
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`w-2 h-2 rounded-full ${style.dot} flex-shrink-0`} />
          <h4 className={`text-sm font-black ${style.title}`}>{today.title}</h4>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
          {today.message}
        </p>
      </div>
    </motion.div>
  );
}
