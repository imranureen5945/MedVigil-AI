import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Plus, Pill, ShieldAlert, HeartPulse, Trash2, UserCheck,
  Calendar, ChevronRight, Loader2, AlertTriangle, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { familySafetyService, getApiErrorMessage } from '../../services/familySafetyService';
import { formatters } from '../../utils/formatters';
import { getSeverityStyle } from './components/severityStyles';
import CreateProfileWizard from './components/CreateProfileWizard';
import ProfileDetailView from './components/ProfileDetailView';
import SafetyChecker from './components/SafetyChecker';
import { useFamily } from '../../context/FamilyContext';

/**
 * Family Safety Vault — the central patient safety data layer.
 * One profile per person holds their safety information (medicines, allergies,
 * conditions, special considerations), and every medicine safety check in the
 * app runs against the explicitly selected profile.
 */
export default function FamilyProfilePage() {
  const { activeMember, setActiveMember } = useFamily();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [banner, setBanner] = useState(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await familySafetyService.getProfiles();
      setProfiles(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Family safety profiles could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(timer);
  }, [banner]);

  const handleCreated = (response) => {
    const extras = response.skipped?.length ? ` Skipped: ${response.skipped.join(', ')}.` : '';
    setBanner({ type: 'success', text: response.message + extras });
    loadProfiles();
    if (response.data?.profile?.id) setSelectedId(response.data.profile.id);
  };

  const handleDeleteCard = async (profile) => {
    if (!confirm(`Delete ${profile.name}'s safety profile? Allergies, medicines, conditions and safety data for this profile will be removed. This cannot be undone.`)) return;
    setDeletingId(profile.id);
    try {
      const response = await familySafetyService.deleteProfile(profile.id);
      setBanner({ type: 'success', text: response.message });
      if (String(selectedId) === String(profile.id)) setSelectedId(null);
      loadProfiles();
    } catch (err) {
      setBanner({ type: 'error', text: getApiErrorMessage(err, 'The profile could not be deleted.') });
    } finally {
      setDeletingId(null);
    }
  };

  const makeActive = (profile) => {
    setActiveMember({ id: profile.id, name: profile.name, relation: profile.relation, age: profile.age });
  };

  // ---------- detail view ----------
  if (selectedId) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <ProfileDetailView
          profileId={selectedId}
          onBack={() => setSelectedId(null)}
          onDeleted={(message) => {
            setSelectedId(null);
            setBanner({ type: 'success', text: message });
            loadProfiles();
          }}
        />
      </div>
    );
  }

  // ---------- grid view ----------
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-teal-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30 mb-2">
            <Users className="w-4 h-4" />
            <span>Family Health Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Family Safety Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Each profile is this person's central safety record — current medicines, allergies, health
            conditions and special considerations. Medicine checks across MedVigil use the selected profile.
          </p>
        </div>

        <button
          onClick={() => setShowWizard(true)}
          className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-teal-500/20 transition flex items-center gap-2 whitespace-nowrap text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Safety Profile</span>
        </button>
      </div>

      {/* Operation banner */}
      {banner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-start gap-2 ${
            banner.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {banner.type === 'error'
            ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            : <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          {banner.text}
        </motion.div>
      )}

      {/* Active profile banner */}
      {profiles.length > 0 && (
        <div className="bg-teal-50/80 border border-teal-200 p-4 rounded-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-teal-900 font-semibold min-w-0">
            <UserCheck className="w-4 h-4 text-teal-700 flex-shrink-0" />
            <span className="truncate">
              Current Active Workspace:{' '}
              <strong className="text-teal-950 font-black">
                {activeMember?.name || 'None selected'} ({activeMember?.relation || '—'})
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-teal-700 font-bold hidden sm:inline whitespace-nowrap">
            Safety checks always confirm whose profile is used
          </span>
        </div>
      )}

      {/* Profiles grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-red-700 mb-4">{error}</p>
          <button onClick={loadProfiles} className="px-5 py-2.5 bg-white border border-red-200 text-red-700 text-xs font-bold rounded-xl hover:bg-red-50 transition">
            Try Again
          </button>
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-teal-700" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 mb-2">No safety profiles yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Create a profile for yourself and each family member to unlock personalized medicine
            safety checks — allergies, interactions and condition-specific cautions.
          </p>
          <button
            onClick={() => setShowWizard(true)}
            className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-teal-700/20 transition flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" /> Create First Safety Profile
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const isActive = String(activeMember?.id) === String(profile.id);
            const initials = (profile.name || 'U').substring(0, 2).toUpperCase();
            return (
              <motion.div
                key={profile.id}
                whileHover={{ y: -3 }}
                className={`bg-white rounded-3xl p-6 transition-all duration-200 relative overflow-hidden flex flex-col justify-between border ${
                  isActive
                    ? 'border-teal-500 ring-2 ring-teal-500 shadow-lg shadow-teal-500/10'
                    : 'border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 bg-teal-700 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl">
                    Active Profile
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-md shadow-teal-700/30'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {initials}
                    </div>
                    {profile.flagCount > 0 && (
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide pt-2">
                        {profile.flagCount} safety flag{profile.flagCount === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 mb-4">
                    <h3 className="text-lg font-black text-slate-900 truncate">{profile.name}</h3>
                    <p className="text-xs font-semibold text-teal-700">
                      {profile.relation}{profile.age != null ? ` • ${profile.age} years old` : ''}
                    </p>
                    {profile.lastUpdated && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Last updated {formatters.formatDate(profile.lastUpdated)}
                      </p>
                    )}
                  </div>

                  {/* Real safety snapshot */}
                  <div className="space-y-2 border-t border-slate-50 pt-4 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Pill className="w-3.5 h-3.5 text-teal-600" /> Current Medicines
                      </span>
                      <span className="font-bold text-slate-800">{profile.snapshot?.medicationCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="flex items-center gap-1 text-slate-400">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500" /> Allergies
                      </span>
                      <span className="font-bold text-slate-800">{profile.snapshot?.allergyCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="flex items-center gap-1 text-slate-400">
                        <HeartPulse className="w-3.5 h-3.5 text-amber-500" /> Health Conditions
                      </span>
                      <span className="font-bold text-slate-800">{profile.snapshot?.conditionCount ?? 0}</span>
                    </div>
                  </div>

                  {/* Top safety flags */}
                  {profile.topFlags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {profile.topFlags.map((flag, i) => {
                        const sev = getSeverityStyle(flag.severity);
                        return (
                          <span key={i} className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${sev.badge}`}>
                            {flag.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => { makeActive(profile); setSelectedId(profile.id); }}
                    className="text-xs font-extrabold px-3.5 py-2 rounded-xl bg-teal-700 text-white hover:bg-teal-800 transition flex items-center gap-1 shadow-sm"
                  >
                    View Safety Profile <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => makeActive(profile)}
                        className="text-[11px] font-bold px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-teal-700 hover:text-white transition"
                        title="Set as active workspace"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(profile)}
                      disabled={deletingId === profile.id}
                      className="p-1.5 text-slate-300 hover:text-red-600 transition rounded-lg"
                      title="Delete profile"
                    >
                      {deletingId === profile.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Medication safety checker */}
      {!loading && profiles.length > 0 && (
        <SafetyChecker profiles={profiles} />
      )}

      {/* Create wizard */}
      {showWizard && (
        <CreateProfileWizard
          onClose={() => setShowWizard(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
