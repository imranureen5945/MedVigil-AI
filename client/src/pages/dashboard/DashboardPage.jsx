import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { familyService } from '../../services/familyService';
import { safetyService } from '../../services/safetyService';
import ErrorState from '../../components/shared/ErrorState';
import HeroWelcome from './components/HeroWelcome';
import DidYouKnowCard from './components/DidYouKnowCard';
import TipOfTheDayCard from './components/TipOfTheDayCard';
import MedVigilImpactCard from './components/MedVigilImpactCard';
import { buildHouseholdSnapshot, getTimeGreeting } from './components/dashboardSafety';

/**
 * MedVigil AI Dashboard — clean, premium, spacious family health command center.
 *
 * Layout: greeting → hero banner → two info cards → impact stats.
 * No feature shortcuts, no sidebar duplication, no clutter.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const members = await familyService.getMembersStrict();
      const scoreResults = await Promise.all(
        members.map((m) => safetyService.getMemberScore(m.id))
      );
      setSnapshot(buildHouseholdSnapshot(members, scoreResults));
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'We couldn\'t load your dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* framer-motion stagger */
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.09, delayChildren: 0.05 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const displayName = user?.name || 'there';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12 relative"
    >
      {/* ── 1. Personalized greeting ──────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="pt-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          {getTimeGreeting()},{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sea-green via-teal-600 to-emerald-500">
            {displayName}
          </span>{' '}
          👋
        </h1>
      </motion.div>

      {/* ── 2. Existing blue hero banner (UNCHANGED) ──────────────────────── */}
      <motion.div variants={itemVariants}>
        <HeroWelcome />
      </motion.div>

      {/* ── Error or dashboard content ────────────────────────────────────── */}
      {error ? (
        <motion.div variants={itemVariants}>
          <ErrorState message={error} onRetry={loadDashboard} />
        </motion.div>
      ) : (
        <>
          {/* 3. Two info cards: Did You Know? + Tip of the Day */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <DidYouKnowCard />
            </motion.div>
            <motion.div variants={itemVariants}>
              <TipOfTheDayCard />
            </motion.div>
          </div>

          {/* 4. MedVigil Impact statistics */}
          <motion.div variants={itemVariants}>
            <MedVigilImpactCard
              metrics={snapshot?.metrics}
              loading={loading}
            />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
