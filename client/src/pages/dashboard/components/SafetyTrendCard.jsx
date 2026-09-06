import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * Safety Score Trend Chart — 6-month household safety history rendered with
 * Recharts. Data from GET /analytics/trends/:memberId (first family member).
 * Empty state shown when no trend data is available.
 */
export default function SafetyTrendCard({ trends, loading }) {
  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="h-48 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const history = trends?.history || [];
  const currentScore = trends?.currentScore ?? null;
  const riskLevel = trends?.riskLevel || 'unknown';

  if (history.length === 0) {
    return (
      <div className="glass-card p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
        <TrendingUp className="w-10 h-10 text-slate-300 mb-3" />
        <h4 className="text-sm font-bold text-slate-600">Safety Score Trend</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Add family member data to see your household safety score history.
        </p>
      </div>
    );
  }

  const scoreColor = currentScore >= 80 ? '#10B981' : currentScore >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-6 shadow-subtle hover:shadow-elevated transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sea-green" />
            Safety Score Trend
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            6-month household safety history
          </p>
        </div>
        {currentScore != null && (
          <div className="text-right">
            <div className="text-3xl font-black" style={{ color: scoreColor }}>
              {currentScore}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {riskLevel}
            </div>
          </div>
        )}
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0D9488" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#0D9488" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[30, 100]}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                fontSize: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={(value) => [`${value}`, 'Safety Score']}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#0D9488"
              strokeWidth={2.5}
              fill="url(#trendGradient)"
              dot={{ fill: '#0D9488', strokeWidth: 2, stroke: '#fff', r: 3.5 }}
              activeDot={{ r: 5.5, stroke: '#0D9488', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
