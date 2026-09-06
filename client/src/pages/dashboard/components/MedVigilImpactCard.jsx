import React from 'react';
import { motion } from 'framer-motion';
import { Pill, ShieldCheck, Users } from 'lucide-react';

/**
 * MedVigil Impact — informational statistics showing household safety coverage.
 *
 * Displays three metrics from the real safety engine:
 *   - Medicines Monitored
 *   - Safety Checks Completed
 *   - Family Members Protected
 *
 * Purely informational — NOT clickable feature shortcuts.
 */

export default function MedVigilImpactCard({ metrics, loading }) {
  if (loading) {
    return (
      <div className="glass-card p-8 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto mb-8" />
        <div className="grid grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-200 mx-auto mb-3" />
              <div className="h-8 bg-slate-200 rounded w-16 mx-auto mb-2" />
              <div className="h-3 bg-slate-200 rounded w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: Pill,
      value: metrics?.medicinesMonitored ?? 0,
      label: 'Medicines Monitored',
      color: 'from-sea-green to-teal-600',
    },
    {
      icon: ShieldCheck,
      value: metrics?.activeSafetyChecks ?? 0,
      label: 'Safety Checks Completed',
      color: 'from-blue-500 to-blue-700',
    },
    {
      icon: Users,
      value: metrics?.protectedMembers ?? 0,
      label: 'Family Members Protected',
      color: 'from-purple-500 to-indigo-600',
    },
  ];

  return (
    <div className="glass-card p-8 shadow-subtle">
      <div className="text-center mb-8">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
          MedVigil Impact
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Your household medication safety coverage
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className="text-center"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center mx-auto mb-4 shadow-md`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-2">
              {stat.value}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
