import { CheckCircle2, AlertTriangle, Stethoscope, AlertOctagon } from 'lucide-react';

/**
 * Self-Medication Risk Assessment — the four safety levels.
 *
 * These are safety / triage categories, NOT diagnoses. The same color, label
 * and icon are used everywhere a level appears (result card, history list),
 * so the patient always sees one consistent meaning per level.
 */
export const TRIAGE_RISK_STYLES = {
  GREEN: {
    label: 'LOW RISK',
    meaning: 'Based on what you reported, self-care with monitoring appears reasonable.',
    Icon: CheckCircle2,
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    panel: 'bg-emerald-50 border-2 border-emerald-300 text-emerald-900',
    accent: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-600'
  },
  YELLOW: {
    label: 'CAUTION',
    meaning: 'Monitor closely — some findings suggest talking to a doctor before self-medicating.',
    Icon: AlertTriangle,
    dot: 'bg-amber-500',
    chip: 'bg-amber-100 text-amber-800 border-amber-300',
    panel: 'bg-amber-50 border-2 border-amber-300 text-amber-900',
    accent: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500'
  },
  ORANGE: {
    label: 'MEDICAL REVIEW RECOMMENDED',
    meaning: 'Talk to a doctor before taking any medicine for these symptoms.',
    Icon: Stethoscope,
    dot: 'bg-orange-500',
    chip: 'bg-orange-100 text-orange-800 border-orange-300',
    panel: 'bg-orange-50 border-2 border-orange-400 text-orange-900',
    accent: 'text-orange-600',
    gradient: 'from-orange-500 to-red-500'
  },
  RED: {
    label: 'URGENT MEDICAL ATTENTION',
    meaning: 'Warning signs were detected — seek urgent medical care now. Do not self-medicate.',
    Icon: AlertOctagon,
    dot: 'bg-red-500',
    chip: 'bg-red-100 text-red-800 border-red-300',
    panel: 'bg-red-600 border-2 border-red-500 text-white',
    accent: 'text-red-600',
    gradient: 'from-red-600 to-red-700'
  }
};

export const getTriageRiskStyle = (level) =>
  TRIAGE_RISK_STYLES[String(level || '').toUpperCase()] || TRIAGE_RISK_STYLES.YELLOW;
