// Shared severity / risk styling for Family Safety Vault components.
// Kept deterministic: the safety engine returns fixed severity keys
// (critical, high, severe, moderate, warning, medium, caution, info, low)
// and overallRisk LOW | MODERATE | HIGH | UNKNOWN.

export const severityStyles = {
  critical: { badge: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-600', label: 'Critical' },
  high: { badge: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500', label: 'High' },
  severe: { badge: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500', label: 'Severe' },
  moderate: { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500', label: 'Moderate' },
  medium: { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500', label: 'Medium' },
  warning: { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500', label: 'Warning' },
  caution: { badge: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500', label: 'Caution' },
  info: { badge: 'bg-sky-100 text-sky-800 border-sky-200', dot: 'bg-sky-500', label: 'Info' },
  low: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', label: 'Low' }
};

export function getSeverityStyle(severity) {
  return severityStyles[String(severity || 'info').toLowerCase()] || severityStyles.info;
}

export const riskStyles = {
  LOW: { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', ring: 'from-emerald-500 to-teal-600', label: 'LOW RISK' },
  MODERATE: { badge: 'bg-amber-100 text-amber-800 border-amber-300', ring: 'from-amber-500 to-orange-500', label: 'MODERATE RISK' },
  HIGH: { badge: 'bg-red-100 text-red-800 border-red-300', ring: 'from-red-500 to-rose-600', label: 'HIGH RISK' },
  UNKNOWN: { badge: 'bg-slate-100 text-slate-700 border-slate-300', ring: 'from-slate-400 to-slate-500', label: 'UNKNOWN' }
};

export function getRiskStyle(risk) {
  return riskStyles[String(risk || 'UNKNOWN').toUpperCase()] || riskStyles.UNKNOWN;
}

// Standard severity options used when recording allergies and conditions
export const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

// Relations offered when creating / editing a profile
export const RELATION_OPTIONS = ['Self', 'Spouse', 'Father', 'Mother', 'Child', 'Sibling', 'Grandparent', 'Other'];

// Structured special-status options (never guessed — explicit user input only)
export const STATUS_OPTIONS = [
  { value: 'unknown', label: 'Not sure' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_applicable', label: 'Not applicable' }
];

// Common health conditions offered as selectable chips (step 2 of the wizard)
export const COMMON_CONDITIONS = [
  'Diabetes',
  'Asthma',
  'Kidney Disease',
  'Liver Disease',
  'Hypertension',
  'Heart Disease',
  'Gastric Ulcer',
  'Thyroid Disease'
];
