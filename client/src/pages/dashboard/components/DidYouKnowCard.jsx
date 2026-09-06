import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

/**
 * Did You Know? — rotating medication-safety fact.
 *
 * Compact, elegant card showing one short fact that changes daily.
 * Not a feature shortcut — purely informational to keep the dashboard fresh.
 */

const FACTS = [
  'Some medicines can interact even when taken hours apart.',
  'Always check the active ingredient before taking multiple medicines.',
  'OTC medicines can still interact with prescription medications.',
  'Grapefruit juice can alter how your body processes certain medicines.',
  'The same medicine can affect children and adults differently.',
  'Expired medicines may lose effectiveness or become harmful.',
  'Herbal supplements can interact with prescription drugs.',
  'Taking medicines with food can change how they are absorbed.',
  'Some antibiotics can reduce the effectiveness of other medications.',
  'Medicines should be stored away from heat, light, and moisture.',
];

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function DidYouKnowCard() {
  const factIndex = getDayOfYear() % FACTS.length;
  const fact = FACTS[factIndex];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card p-6 shadow-subtle hover:shadow-elevated transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Did You Know?
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {fact}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
