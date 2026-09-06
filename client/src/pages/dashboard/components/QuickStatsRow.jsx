import React from 'react';
import { motion } from 'framer-motion';
import { Pill, ScanLine, AlertTriangle, Users } from 'lucide-react';

/**
 * Quick household medication overview — 4 stat cards showing active medicines,
 * scans this month, active alerts, and family members. Data from the
 * analytics usage endpoint (no fabricated values).
 */
export default function QuickStatsRow({ usage, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-200 mb-3" />
            <div className="h-6 bg-slate-200 rounded w-12 mb-1" />
            <div className="h-3 bg-slate-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      icon: Pill,
      label: 'Active Medicines',
      value: usage?.totalMedicines ?? 0,
      color: 'from-sea-green to-teal-600',
      accent: 'text-sea-green',
    },
    {
      icon: ScanLine,
      label: 'Scans This Month',
      value: usage?.scansThisMonth ?? 0,
      color: 'from-blue-500 to-blue-700',
      accent: 'text-blue-600',
    },
    {
      icon: AlertTriangle,
      label: 'Active Alerts',
      value: usage?.alertsCount ?? 0,
      color: usage?.alertsCount > 0 ? 'from-amber-500 to-orange-600' : 'from-slate-400 to-slate-500',
      accent: usage?.alertsCount > 0 ? 'text-amber-600' : 'text-slate-500',
    },
    {
      icon: Users,
      label: 'Family Members',
      value: usage?.familyMemberCount ?? 0,
      color: 'from-purple-500 to-indigo-600',
      accent: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          whileHover={{ y: -3 }}
          className="glass-card p-5 shadow-subtle hover:shadow-elevated transition-all duration-300"
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center shadow-sm mb-3`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div className={`text-2xl font-black text-slate-900 ${stat.accent}`}>
            {stat.value}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
