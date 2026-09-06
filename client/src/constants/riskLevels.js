export const RISK_LEVELS = {
  safe: {
    label: 'Safe',
    color: '#10B981',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeClass: 'bg-emerald-500 text-white',
    ringColor: '#10B981',
    description: 'No critical safety conflicts or DRAP warnings detected.'
  },
  moderate: {
    label: 'Moderate Risk',
    color: '#F59E0B',
    bgClass: 'bg-amber-50 text-amber-800 border-amber-200',
    badgeClass: 'bg-amber-500 text-slate-950',
    ringColor: '#F59E0B',
    description: 'Potential drug interactions or condition precautions require review.'
  },
  critical: {
    label: 'High Risk',
    color: '#EF4444',
    bgClass: 'bg-red-50 text-red-700 border-red-200',
    badgeClass: 'bg-red-500 text-white',
    ringColor: '#EF4444',
    description: 'Critical contraindications, allergy conflict, or DRAP recall detected.'
  }
};

export const getRiskInfo = (score) => {
  const num = Number(score) || 0;
  if (num >= 80) return RISK_LEVELS.safe;
  if (num >= 50) return RISK_LEVELS.moderate;
  return RISK_LEVELS.critical;
};
