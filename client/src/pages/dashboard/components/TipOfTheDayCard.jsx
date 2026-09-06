import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * Tip of the Day — rotating practical medication-safety tip.
 *
 * Compact, elegant card showing one short actionable tip that changes daily.
 * Not a feature shortcut — purely informational guidance.
 */

const TIPS = [
  'Keep an updated list of all medicines your family members take.',
  'Set reminders for medication times to avoid missed doses.',
  'Store medicines in their original containers with labels intact.',
  'Review your family\'s medicine list with a doctor every 6 months.',
  'Check for drug interactions before starting a new medicine.',
  'Never share prescription medicines between family members.',
  'Keep a record of any allergic reactions to medicines.',
  'Dispose of unused or expired medicines safely at a pharmacy.',
  'Ask your pharmacist about food interactions with new prescriptions.',
  'Keep emergency contact numbers easily accessible.',
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function TipOfTheDayCard() {
  // Offset by 5 days so tip and fact don't rotate in sync
  const tipIndex = (getDayOfYear() + 5) % TIPS.length;
  const tip = TIPS[tipIndex];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-6 shadow-subtle hover:shadow-elevated transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sea-green to-teal-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Tip of the Day
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {tip}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
