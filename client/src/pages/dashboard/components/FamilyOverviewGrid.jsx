import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Pill, AlertTriangle, Heart } from 'lucide-react';

/**
 * Quick Family Health Summary — per-member health cards showing safety score,
 * risk level, active medicines, and alerts. Each card navigates to the
 * Family Safety Vault. Data from buildHouseholdSnapshot.memberScores.
 */

function getRiskStyle(riskLevel) {
  const map = {
    safe: { bar: 'bg-emerald-500', text: 'text-emerald-700' },
    moderate: { bar: 'bg-amber-500', text: 'text-amber-700' },
    critical: { bar: 'bg-red-500', text: 'text-red-700' },
  };
  return map[riskLevel] || map.safe;
}

function MemberCard({ member, index }) {
  const navigate = useNavigate();
  const risk = getRiskStyle(member.riskLevel);
  const score = member.score ?? null;
  const barWidth = score != null ? Math.min(100, Math.max(5, score)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="glass-card p-5 shadow-subtle hover:shadow-elevated transition-all duration-300 cursor-pointer group"
      onClick={() => navigate('/family-profile')}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sea-green to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
            {(member.name || '?').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 leading-tight">
              {member.name}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              {member.relation || 'Family'}
              {member.age ? ` • ${member.age} yrs` : ''}
            </p>
          </div>
        </div>
        {score != null && (
          <div className={`text-xl font-black ${risk.text}`}>{score}</div>
        )}
      </div>

      {/* Score bar */}
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ delay: index * 0.08 + 0.2, duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${risk.bar}`}
        />
      </div>

      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold flex-wrap">
        <span className="flex items-center gap-1">
          <Pill className="w-3 h-3" /> {member.activeMedsCount} meds
        </span>
        {member.alertsCount > 0 && (
          <span className="flex items-center gap-1 text-amber-600">
            <AlertTriangle className="w-3 h-3" /> {member.alertsCount} alerts
          </span>
        )}
        {member.conditionCount > 0 && (
          <span className="flex items-center gap-1 text-blue-600">
            <Heart className="w-3 h-3" /> {member.conditionCount} conditions
          </span>
        )}
      </div>

      <div className="flex items-center justify-end mt-3 pt-2.5 border-t border-slate-100">
        <span className="text-[10px] font-bold text-sea-green group-hover:text-teal-600 transition flex items-center gap-1">
          View Profile
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </motion.div>
  );
}

export default function FamilyOverviewGrid({ memberScores, loading }) {
  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded w-20" />
                  <div className="h-2.5 bg-slate-200 rounded w-14" />
                </div>
              </div>
              <div className="h-2 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!memberScores || memberScores.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-600">No Family Members</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Add family members in the Family Safety Vault to see personalized health summaries.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 shadow-subtle">
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-4 h-4 text-sea-green" />
        <h3 className="text-sm font-black text-slate-900">Quick Family Health Summary</h3>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
          {memberScores.length} {memberScores.length === 1 ? 'member' : 'members'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {memberScores.map((member, i) => (
          <MemberCard key={member.id || i} member={member} index={i} />
        ))}
      </div>
    </div>
  );
}
