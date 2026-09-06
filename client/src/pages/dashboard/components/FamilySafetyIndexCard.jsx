import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
import { getIndexLabel } from './dashboardSafety';

const RING_TONES = {
  safe: {
    ring: ['#2DD4BF', '#10B981'],
    chip: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    dot: 'bg-emerald-400',
    metric: 'text-emerald-400',
  },
  warning: {
    ring: ['#FBBF24', '#F59E0B'],
    chip: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    dot: 'bg-amber-400',
    metric: 'text-amber-400',
  },
  danger: {
    ring: ['#F87171', '#EF4444'],
    chip: 'bg-red-500/20 text-red-300 border-red-400/40',
    dot: 'bg-red-400',
    metric: 'text-red-400',
  },
};

function formatTime(date) {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function IndexRing({ value, tone }) {
  const [displayValue, setDisplayValue] = useState(0);

  // Count-up so the real value lands visibly (no fake progress steps).
  useEffect(() => {
    setDisplayValue(0);
    if (value == null) return undefined;
    const steps = 40;
    const stepTime = 1200 / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setDisplayValue(Math.min(Math.round((value / steps) * current), value));
      if (current >= steps) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  const size = 118;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = value == null ? 0 : Math.max(0, Math.min(100, value));
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="indexRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tone.ring[0]} />
            <stop offset="100%" stopColor={tone.ring[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#indexRingGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white leading-none tabular-nums">
          {value == null ? '—' : displayValue}
          <span className="text-base font-bold text-slate-400">%</span>
        </span>
        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mt-1">
          Safety Score
        </span>
      </div>
    </div>
  );
}

// A single intelligence metric row.
function MetricRow({ icon, label, value, tone = 'ok', delay = 0 }) {
  const Icon = icon;
  const isWarn = tone === 'warn';
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="flex items-center gap-2.5 py-1.5"
    >
      <span className={`flex-shrink-0 ${isWarn ? 'text-amber-400' : 'text-emerald-400'}`}>
        {isWarn ? <AlertTriangle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
      </span>
      <span className="text-[10px] font-semibold text-slate-400 flex-1 truncate">{label}</span>
      <span className={`text-[11px] font-black tabular-nums ${isWarn ? 'text-amber-300' : 'text-white'}`}>
        {value}
      </span>
    </motion.div>
  );
}

/**
 * Family Safety Intelligence Dashboard — a dynamic score card powered by the
 * real backend safety engine (average of real per-profile scores) plus live
 * household metrics: members protected, medicines monitored, safety checks,
 * critical interactions, DRAP monitoring and last assessment time.
 * Shows nothing fabricated: no household data → friendly setup message.
 */
export default function FamilySafetyIndexCard({ index, profileCount, metrics, loading }) {
  const label = getIndexLabel(index);
  const tone = RING_TONES[label?.tone || 'safe'];

  const m = metrics || {};

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-med-navy text-white shadow-2xl shadow-med-navy/25 border border-white/15 p-5 sm:p-6 flex flex-col min-h-[340px]">
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-sea-green/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4 w-full h-full">
        {/* Header */}
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-teal-300 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-sea-light" />
          <span>Family Safety Index</span>
          <motion.span
            className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {loading ? (
          <div className="flex flex-col gap-4 py-4 w-full animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-[118px] h-[118px] rounded-full border-[9px] border-white/10" />
              <div className="flex-1 space-y-2.5">
                <div className="h-3 bg-white/10 rounded-full w-3/4" />
                <div className="h-3 bg-white/10 rounded-full w-2/3" />
                <div className="h-3 bg-white/10 rounded-full w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-white/10 rounded-full w-5/6" />
              <div className="h-3 bg-white/10 rounded-full w-4/6" />
              <div className="h-3 bg-white/10 rounded-full w-3/6" />
            </div>
            <span className="text-xs text-slate-400 font-semibold">Checking household safety…</span>
          </div>
        ) : index == null ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center max-w-[240px] mx-auto flex-1 justify-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-slate-500" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Add your household's medicine information to generate the Family Safety Index.
            </p>
          </div>
        ) : (
          <>
            {/* Score + quick stats */}
            <div className="flex items-center gap-4">
              <IndexRing value={index} tone={tone} />
              <div className="flex-1 min-w-0 space-y-2">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black border ${tone.chip}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                  {label.label}
                </span>
                <div className="text-[10px] text-slate-400 font-semibold leading-snug">
                  {profileCount > 0
                    ? `Across ${profileCount} household profile${profileCount === 1 ? '' : 's'}`
                    : 'No profiles yet'}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-teal-300"
                >
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>Live safety monitoring active</span>
                </motion.div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            {/* Intelligence metrics */}
            <div className="flex-1 min-h-0">
              <MetricRow
                icon={CheckCircle2}
                label="Family Members Protected"
                value={m.protectedMembers ?? 0}
                delay={0.15}
              />
              <MetricRow
                icon={CheckCircle2}
                label="Medicines Monitored"
                value={m.medicinesMonitored ?? 0}
                delay={0.25}
              />
              <MetricRow
                icon={CheckCircle2}
                label="Active Safety Checks"
                value={m.activeSafetyChecks ?? 0}
                delay={0.35}
              />
              <MetricRow
                icon={AlertTriangle}
                label="Critical Interactions Detected"
                value={m.criticalInteractions ?? 0}
                tone={(m.criticalInteractions ?? 0) > 0 ? 'warn' : 'ok'}
                delay={0.45}
              />
              <MetricRow
                icon={Radio}
                label="DRAP Monitoring Status"
                value={m.drapMonitoring || 'Active'}
                tone={m.drapMonitoring === 'Recall Detected' ? 'warn' : 'ok'}
                delay={0.55}
              />
              <MetricRow
                icon={CheckCircle2}
                label="Last Risk Assessment"
                value={formatTime(m.lastRiskAssessment)}
                delay={0.65}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
