import React from 'react';
import { motion } from 'framer-motion';

/**
 * Dashboard hero — Family Medication Safety Intelligence Visualization.
 *
 * A futuristic AI network showing the MedVigil intelligence core connected to
 * family members and their medicines, with live safety telemetry: interaction
 * detection, allergy alerts, duplicate-ingredient warnings, risk assessment
 * and DRAP monitoring. Animated data flows run along every connection.
 *
 * Purely presentational — communicates:
 *   "MedVigil AI protects every medicine decision across the household."
 */

// ── Network layout constants ─────────────────────────────────────────────────
const CX = 190; // central core x
const CY = 174; // central core y

// Family member nodes (top arc)
const FAMILY_NODES = [
  { x: 62, y: 52, initials: 'A', label: 'Mom', conditions: 'HTN' },
  { x: 190, y: 30, initials: 'D', label: 'Dad', conditions: 'T2D' },
  { x: 318, y: 52, initials: 'S', label: 'Son', conditions: 'Asthma' },
];

// Medicine / safety-indicator nodes (bottom arc)
const MED_NODES = [
  { x: 42, y: 210, label: 'Metformin', category: 'T2D', state: 'clear' },
  { x: 92, y: 286, label: 'Insulin', category: 'T2D', state: 'clear' },
  { x: 190, y: 316, label: 'Sitagliptin', category: 'T2D', state: 'clear' },
  { x: 288, y: 286, label: 'Glimepiride', category: 'T2D', state: 'dup' }, // duplicate-ingredient warning
  { x: 338, y: 210, label: 'Metoprolol', category: 'HTN', state: 'clear' },
];

// Floating status indicators around the network
const INDICATORS = [
  { x: 30, y: 130, text: '✓ Interaction Check', tone: 'ok' },
  { x: 310, y: 116, text: '! Allergy Alert', tone: 'warn' },
  { x: 118, y: 178, text: 'DRAP', tone: 'ok' },
  { x: 240, y: 152, text: '! Duplicate', tone: 'warn' },
];

// One animated data-pulse travelling along a line.
function FlowPulse({ from, to, delay, color }) {
  return (
    <motion.circle
      r="3"
      fill={color}
      initial={{ cx: from.x, cy: from.y, opacity: 0 }}
      animate={{
        cx: [from.x, to.x],
        cy: [from.y, to.y],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        delay,
        ease: 'linear',
        times: [0, 0.1, 0.85, 1],
      }}
    />
  );
}

// A connection line with animated data flow.
function ConnectionLine({ from, to, color = '#2DD4BF', dashed = false }) {
  return (
    <>
      <line
        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke={color} strokeOpacity={dashed ? 0.3 : 0.45} strokeWidth={dashed ? 1 : 1.6}
        strokeDasharray={dashed ? '4 4' : undefined}
      />
      <FlowPulse from={from} to={to} delay={0} color={color} />
      <FlowPulse from={to} to={from} delay={0.9} color={color} />
    </>
  );
}

export default function HeroWelcome() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-med-dark via-slate-900 to-med-navy text-white shadow-2xl shadow-med-navy/25 border border-white/15 min-h-[340px] flex">
      {/* Ambient light */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-24 -bottom-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute right-1/3 -top-32 w-80 h-80 bg-sea-green/20 rounded-full blur-3xl pointer-events-none"
      />

      {/* Text side */}
      <div className="relative z-10 flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-4 min-w-0">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 self-start rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-sea-light shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-sea-light animate-pulse" />
          MedVigil AI
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
          Protecting Every{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sea-light via-teal-200 to-blue-300">
            Medicine Decision
          </span>{' '}
          in Your Home
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md font-normal">
          AI-powered medication safety, interaction detection, family health protection,
          condition-aware medicine analysis, and smart risk assessment for Pakistani households.
        </p>
      </div>

      {/* Visualization — Family Medication Safety Intelligence Network */}
      <div className="relative hidden md:flex items-center justify-center flex-1 max-w-sm p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-full"
        >
          <svg viewBox="0 0 380 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <defs>
              <radialGradient id="heroCoreGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#2DD4BF" stopOpacity="0.5" />
                <stop offset="0.6" stopColor="#2DD4BF" stopOpacity="0.12" />
                <stop offset="1" stopColor="#2DD4BF" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="heroCoreBody" x1="150" y1="130" x2="230" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0F2D4A" />
                <stop offset="1" stopColor="#061325" />
              </linearGradient>
              <linearGradient id="heroCoreRing" x1="150" y1="130" x2="230" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2DD4BF" />
                <stop offset="1" stopColor="#0D9488" />
              </linearGradient>
              <radialGradient id="heroNodeGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#2DD4BF" stopOpacity="0.25" />
                <stop offset="1" stopColor="#2DD4BF" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Outer orbital rings — scanning / monitoring pulse */}
            <motion.circle
              cx={CX} cy={CY} r="128"
              stroke="#14B8A6" strokeOpacity="0.12" strokeWidth="1" fill="none"
              strokeDasharray="2 6"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            />
            <motion.circle
              cx={CX} cy={CY} r="152"
              stroke="#2DD4BF" strokeOpacity="0.07" strokeWidth="1" fill="none"
              strokeDasharray="1 8"
              animate={{ rotate: -360 }}
              transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            />

            {/* Wide core glow */}
            <circle cx={CX} cy={CY} r="150" fill="url(#heroNodeGlow)" />

            {/* Connections: family → core (data flows) */}
            {FAMILY_NODES.map((n, i) => (
              <ConnectionLine key={`f-${i}`} from={n} to={{ x: CX, y: CY }} color="#2DD4BF" />
            ))}
            {/* Connections: core → medicines */}
            {MED_NODES.map((n, i) => (
              <ConnectionLine
                key={`m-${i}`}
                from={{ x: CX, y: CY }}
                to={n}
                color={n.state === 'dup' ? '#FBBF24' : '#38BDF8'}
                dashed={n.state === 'dup'}
              />
            ))}
            {/* Cross-links: medicines sharing an ingredient (duplicate detection) */}
            <ConnectionLine from={MED_NODES[0]} to={MED_NODES[2]} color="#FBBF24" dashed />
            <ConnectionLine from={MED_NODES[2]} to={MED_NODES[3]} color="#FBBF24" dashed />

            {/* Family member nodes — glassmorphic cards */}
            {FAMILY_NODES.map((n, i) => (
              <motion.g
                key={`fn-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
              >
                <circle cx={n.x} cy={n.y} r="26" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
                <circle cx={n.x} cy={n.y} r="26" fill="url(#heroNodeGlow)" />
                <circle cx={n.x} cy={n.y} r="4" fill="#2DD4BF" />
                <text
                  x={n.x} y={n.y - 6}
                  textAnchor="middle" fill="#E2F5F1" fontSize="11" fontWeight="700"
                >
                  {n.initials}
                </text>
                <text
                  x={n.x} y={n.y + 10}
                  textAnchor="middle" fill="#7DD3C8" fontSize="7" fontWeight="600"
                >
                  {n.conditions}
                </text>
                {/* Online pulse ring */}
                <motion.circle
                  cx={n.x} cy={n.y} r="26"
                  stroke="#2DD4BF" strokeWidth="1" fill="none"
                  animate={{ opacity: [0.35, 0, 0], r: [26, 34, 34] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8 }}
                />
              </motion.g>
            ))}

            {/* Medicine nodes — pills with state indicators */}
            {MED_NODES.map((n, i) => {
              const warn = n.state === 'dup';
              return (
                <motion.g
                  key={`mn-${i}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 200 }}
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                >
                  <rect
                    x={n.x - 9} y={n.y - 4.5} width="18" height="9" rx="4.5"
                    fill={warn ? '#F59E0B' : '#0D9488'}
                    stroke={warn ? '#FCD34D' : '#2DD4BF'}
                    strokeWidth="0.8"
                  />
                  <line x1={n.x} y1={n.y - 4.5} x2={n.x} y2={n.y + 4.5} stroke="#061325" strokeWidth="0.7" strokeOpacity="0.5" />
                  {warn && (
                    <motion.circle
                      cx={n.x + 7} cy={n.y - 6} r="3.5" fill="#F59E0B"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  )}
                  <text
                    x={n.x} y={n.y + 18}
                    textAnchor="middle" fill="#94A3B8" fontSize="7.5" fontWeight="500"
                  >
                    {n.label}
                  </text>
                </motion.g>
              );
            })}

            {/* Central MedVigil AI Intelligence Core */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              style={{ transformOrigin: `${CX}px ${CY}px` }}
            >
              <circle cx={CX} cy={CY} r="118" fill="url(#heroCoreGlow)" />
              <motion.circle
                cx={CX} cy={CY} r="52"
                stroke="#2DD4BF" strokeWidth="1" fill="none" strokeOpacity="0.3"
                animate={{ r: [52, 62, 52], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <circle cx={CX} cy={CY} r="40" fill="url(#heroCoreBody)" stroke="url(#heroCoreRing)" strokeWidth="2" />
              <circle cx={CX} cy={CY} r="31" stroke="#14B8A6" strokeOpacity="0.35" strokeWidth="1" fill="none" />
              {/* AI core content — brain/pulse icon */}
              <path
                d={`M${CX - 12} ${CY} l7 8 l10 -16 l7 8`}
                stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
              />
              {/* Rotating status arcs around the core */}
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
              >
                <path
                  d={`M ${CX + 46} ${CY} A 46 46 0 0 1 ${CX - 20} ${CY - 41}`}
                  stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.7"
                />
                <path
                  d={`M ${CX - 46} ${CY} A 46 46 0 0 1 ${CX + 20} ${CY + 41}`}
                  stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" fill="none" strokeOpacity="0.5"
                />
              </motion.g>
              <motion.circle
                cx={CX} cy={CY} r="40"
                stroke="#2DD4BF" fill="none" strokeWidth="1.5"
                animate={{ opacity: [0.5, 0, 0], r: [40, 56, 56] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
              <text x={CX} y={CY + 60} textAnchor="middle" fill="#7DD3C8" fontSize="8" fontWeight="700" letterSpacing="2">
                MEDVIGIL AI
              </text>
              <text x={CX} y={CY + 71} textAnchor="middle" fill="#5E8B85" fontSize="6.5" fontWeight="500" letterSpacing="1">
                SAFETY INTELLIGENCE CORE
              </text>
            </motion.g>

            {/* Floating status indicators */}
            {INDICATORS.map((ind, i) => (
              <motion.g
                key={`ind-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, -4, 0] }}
                transition={{
                  opacity: { delay: 1 + i * 0.3, duration: 0.5 },
                  y: { duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                <rect
                  x={ind.x} y={ind.y}
                  width={ind.text.length * 5.2 + 12} height="18" rx="9"
                  fill="rgba(6,19,37,0.85)"
                  stroke={ind.tone === 'warn' ? 'rgba(251,191,36,0.4)' : 'rgba(45,212,191,0.4)'}
                  strokeWidth="1"
                />
                <circle
                  cx={ind.x + 9} cy={ind.y + 9} r="2.5"
                  fill={ind.tone === 'warn' ? '#FBBF24' : '#2DD4BF'}
                />
                <text
                  x={ind.x + 15} y={ind.y + 12}
                  fill={ind.tone === 'warn' ? '#FCD34D' : '#99F6E4'}
                  fontSize="8" fontWeight="600"
                >
                  {ind.text}
                </text>
              </motion.g>
            ))}

            {/* Subtle grid backdrop */}
            <g stroke="#14B8A6" strokeOpacity="0.05" strokeWidth="0.5">
              {Array.from({ length: 7 }, (_, i) => (
                <line key={`gv-${i}`} x1={40 + i * 50} y1="0" x2={40 + i * 50} y2="350" />
              ))}
              {Array.from({ length: 7 }, (_, i) => (
                <line key={`gh-${i}`} x1="0" y1={40 + i * 50} x2="380" y2={40 + i * 50} />
              ))}
            </g>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
