import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Stethoscope, ShieldCheck, Phone, MapPin, Rocket,
  CheckCircle2, GraduationCap, Award, Activity, Clock, ArrowDown,
} from 'lucide-react';

/**
 * Future Vision — MedVigil AI product roadmap page.
 *
 * Showcases three upcoming features as exciting milestones:
 *   1. Verified Doctor Network
 *   2. Emergency Doctor Support
 *   3. Smart Nearby Doctor Finder
 *
 * Purely presentational — no actual functionality is implemented.
 */

/* ── Animation variants ─────────────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ── Reusable check-row inside each vision card ─────────────────────────── */
function FeatureItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2.5">
      <CheckCircle2 className="w-4 h-4 text-sea-green flex-shrink-0" />
      <span className="text-sm text-slate-600 font-medium">{text}</span>
    </div>
  );
}

/* ── Status badge (COMING SOON / IN DEVELOPMENT) ────────────────────────── */
function StatusBadge({ label, color }) {
  const styles = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${styles[color] || styles.teal}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${color === 'amber' ? 'bg-amber-500' : 'bg-teal-500'}`} />
      {label}
    </span>
  );
}

/* ── Connector line between cards ───────────────────────────────────────── */
function Connector() {
  return (
    <div className="flex justify-center py-2">
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        whileInView={{ height: 48, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-px bg-gradient-to-b from-sea-green/40 via-teal-300/30 to-transparent"
      />
    </div>
  );
}

/* ── Milestone number ───────────────────────────────────────────────────── */
function MilestoneNum({ n }) {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sea-green to-teal-600 text-white flex items-center justify-center text-xs font-black shadow-md flex-shrink-0">
      {n}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function FutureVisionPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-16 relative"
    >
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="text-center pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sea-green/10 to-teal-500/10 border border-sea-green/20 mb-6">
          <Sparkles className="w-4 h-4 text-sea-green" />
          <span className="text-xs font-bold text-sea-green uppercase tracking-wider">
            Product Roadmap
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          The Future of{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sea-green via-teal-600 to-emerald-500">
            MedVigil AI
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-500 font-medium mt-4 max-w-2xl mx-auto leading-relaxed">
          We're building more ways to make healthcare safer, smarter and more connected.
        </p>
      </motion.div>

      {/* ── ROADMAP MILESTONES ───────────────────────────────────────────── */}

      {/* ─── Milestone 1: Verified Doctor Network ─────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="glass-card p-7 sm:p-8 shadow-subtle hover:shadow-elevated transition-all duration-300 relative overflow-hidden">
          {/* Accent stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-sea-green to-teal-600" />

          <div className="pl-3">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-3">
                <MilestoneNum n={1} />
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sea-green to-teal-600 text-white flex items-center justify-center shadow-md">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Verified Doctor Network
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Trusted Specialists, Coming Soon
                  </p>
                </div>
              </div>
              <StatusBadge label="Coming Soon" color="teal" />
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-2xl">
              A curated network of verified specialist and consultant doctors.
              Every profile will include verified credentials, qualifications,
              and professional experience — so you always know who's caring for your family.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FeatureItem icon={Stethoscope} text="Doctor specialization & consultant status" />
              <FeatureItem icon={GraduationCap} text="Degrees & professional qualifications" />
              <FeatureItem icon={Award} text="Verified credentials & certifications" />
              <FeatureItem icon={ShieldCheck} text="Professional experience & track record" />
            </div>

            {/* Mini doctor-profile preview */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/30 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sea-green to-teal-700 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  Dr
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">Dr. Specialist Name</span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      <span className="text-[9px] font-black text-blue-700 uppercase">Verified</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Consultant Cardiologist · MBBS, FCPS · 15 yrs experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Connector />

      {/* ─── Milestone 2: Emergency Doctor Support ────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="glass-card p-7 sm:p-8 shadow-subtle hover:shadow-elevated transition-all duration-300 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-500" />

          <div className="pl-3">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-3">
                <MilestoneNum n={2} />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md">
                  <Phone className="w-6 h-6" />
                  {/* Animated pulse ring */}
                  <span className="absolute inset-0 rounded-2xl border-2 border-amber-400/50 animate-ping" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Emergency Doctor Support
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Help When It Matters Most
                  </p>
                </div>
              </div>
              <StatusBadge label="In Development" color="amber" />
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-2xl">
              A future emergency support system connecting you to verified doctors
              during urgent situations. For exceptional, properly verified emergency
              cases, the system may also enable doctor home visits for patient assessment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FeatureItem icon={Phone} text="Call or message verified doctors" />
              <FeatureItem icon={Activity} text="Urgent situation response system" />
              <FeatureItem icon={Clock} text="Rapid verification for emergency access" />
              <FeatureItem icon={Stethoscope} text="Potential home visits (verified cases)" />
            </div>

            {/* Emergency concept mini-card */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50/60 to-orange-50/40 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm">
                    <Activity className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-slate-800">Emergency Connect</span>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Instantly connect to a verified on-call specialist during emergencies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <Connector />

      {/* ─── Milestone 3: Smart Nearby Doctor Finder ──────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="glass-card p-7 sm:p-8 shadow-subtle hover:shadow-elevated transition-all duration-300 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600" />

          <div className="pl-3">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-3">
                <MilestoneNum n={3} />
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Smart Nearby Doctor Finder
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    The Right Doctor, Closer to You
                  </p>
                </div>
              </div>
              <StatusBadge label="Coming Soon" color="teal" />
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-2xl">
              A future feature that will recommend nearby verified doctors based on
              your symptoms, location, and the relevant specialty. Discover doctors
              nearby and consult them in person — all within the MedVigil AI ecosystem.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FeatureItem icon={MapPin} text="Location-based doctor discovery" />
              <FeatureItem icon={Stethoscope} text="Symptom + specialty matching" />
              <FeatureItem icon={ShieldCheck} text="Only verified doctors shown" />
              <FeatureItem icon={Activity} text="In-person consultation guidance" />
            </div>

            {/* Illustrative map mockup */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/40 border border-blue-100 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 z-10">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">Doctors Near You</span>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Smart matching based on your needs
                    </p>
                  </div>
                </div>
                {/* Decorative map pins */}
                <div className="relative w-28 h-16 flex-shrink-0 hidden sm:block">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute top-0 left-2"
                  >
                    <MapPin className="w-5 h-5 text-sea-green fill-sea-green/20" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2.3, ease: 'easeInOut', delay: 0.4 }}
                    className="absolute top-5 left-14"
                  >
                    <MapPin className="w-4 h-4 text-teal-600 fill-teal-600/20" />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: 0.7 }}
                    className="absolute top-1 left-24"
                  >
                    <MapPin className="w-5 h-5 text-blue-600 fill-blue-600/20" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── BOTTOM: We're just getting started ───────────────────────────── */}
      <motion.div variants={fadeUp} className="text-center pt-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sea-green to-teal-600 text-white shadow-lg shadow-teal-900/20 mb-4">
          <Rocket className="w-7 h-7" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          We're just getting started.
        </h2>
        <p className="text-sm text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
          More connected, accessible and safer healthcare experiences are on the way.
        </p>
      </motion.div>
    </motion.div>
  );
}
