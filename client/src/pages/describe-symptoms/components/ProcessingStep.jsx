import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Real processing states — the safety checks genuinely run while these
 * messages are shown. There are no fake progress percentages: the step simply
 * advances to the result as soon as the server responds.
 */
export default function ProcessingStep({ messages }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 1400);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="max-w-2xl mx-auto py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-med-navy to-slate-950 border border-sea-green/30 shadow-2xl text-white text-center space-y-7 relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-sea-light/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-20 h-20 mx-auto rounded-3xl bg-slate-950 border border-sea-green/40 shadow-glow-teal flex items-center justify-center"
        >
          <ShieldCheck className="w-10 h-10 text-sea-light" />
        </motion.div>

        <div className="relative h-14 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-sm sm:text-base font-black text-white tracking-tight"
            >
              {messages[index]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-2">
          {messages.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === index ? 'w-8 bg-sea-light' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          Running verified safety checks — this usually takes a few seconds.
        </p>
      </motion.div>
    </div>
  );
}
