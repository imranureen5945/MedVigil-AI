import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon, AlertTriangle, Activity, ShieldAlert, ArrowRight,
} from 'lucide-react';

/**
 * High-Risk Medicines Requiring Attention — surfaces critical, severe, and
 * high-severity alerts from the real safety engine. Shows nothing when no
 * high-risk alerts exist. Never fabricates alerts.
 */

const ALERT_ICONS = {
  interaction: AlertTriangle,
  recall: ShieldAlert,
  allergy: AlertOctagon,
  duplicate: Activity,
  amr: AlertTriangle,
  condition: Activity,
};

function getAlertStyle(severity) {
  const sev = String(severity || '').toLowerCase();
  if (['critical', 'severe'].includes(sev)) {
    return {
      icon: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700',
      stripe: 'bg-red-500',
    };
  }
  if (sev === 'high') {
    return {
      icon: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      stripe: 'bg-amber-500',
    };
  }
  return {
    icon: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    stripe: 'bg-teal-500',
  };
}

export default function HighRiskAlertsCard({ alerts, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-9 h-9 rounded-xl bg-slate-200 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-2.5 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const highRisk = (alerts || []).filter((a) => {
    const sev = String(a.severity || '').toLowerCase();
    return ['critical', 'severe', 'high'].includes(sev);
  });

  if (highRisk.length === 0) return null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-6 shadow-subtle hover:shadow-elevated transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-black text-slate-900">
            High-Risk Medicines Requiring Attention
          </h3>
        </div>
        <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
          {highRisk.length} {highRisk.length === 1 ? 'alert' : 'alerts'}
        </span>
      </div>

      <div className="space-y-2.5">
        {highRisk.slice(0, 5).map((alert, i) => {
          const style = getAlertStyle(alert.severity);
          const Icon = ALERT_ICONS[alert.type] || AlertTriangle;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${style.bg} border ${style.border} relative overflow-hidden`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.stripe}`} />
              <div className={`w-9 h-9 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center flex-shrink-0 ml-1`}>
                <Icon className={`w-4 h-4 ${style.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className="text-xs font-bold text-slate-800 truncate">
                    {alert.title || alert.type}
                  </h5>
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${style.badge}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {alert.memberName ? `${alert.memberName} • ` : ''}
                  {alert.message || ''}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/safety-center')}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-sea-green hover:text-teal-600 transition"
      >
        View all safety details
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
