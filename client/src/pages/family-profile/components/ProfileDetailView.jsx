import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Pencil, Trash2, Pill, ShieldAlert, HeartPulse, Flag,
  Baby, Phone, Calendar, CheckCircle2, AlertTriangle, BadgeCheck,
  ShieldQuestion, Loader2, Plus, Info, ShieldCheck
} from 'lucide-react';
import { familySafetyService, getApiErrorMessage } from '../../../services/familySafetyService';
import { formatters } from '../../../utils/formatters';
import { getSeverityStyle } from './severityStyles';
import AddMedicationModal from './AddMedicationModal';
import AddAllergyModal from './AddAllergyModal';
import AddConditionModal from './AddConditionModal';
import EditProfileModal from './EditProfileModal';

/**
 * Full safety overview of one profile — the "SAFETY SNAPSHOT" hub defined by
 * the vault spec: snapshot counts, auto-generated safety flags, current
 * medicines, allergies, conditions, special considerations and emergency
 * information, each independently editable with "Last updated" tracking.
 */
export default function ProfileDetailView({ profileId, onBack, onDeleted }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null); // item being deleted
  const [banner, setBanner] = useState(null); // { type, text }
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) { setLoading(true); setError(''); }
    try {
      const data = await familySafetyService.getProfileOverview(profileId);
      setOverview(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'This safety profile could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 7000);
    return () => clearTimeout(timer);
  }, [banner]);

  const showBanner = (type, text) => setBanner({ type, text });

  const handleDeleteProfile = async () => {
    const profile = overview?.profile;
    if (!profile) return;
    if (!confirm(`Delete ${profile.name}'s safety profile? Allergies, medicines, conditions and safety data for this profile will be removed. This cannot be undone.`)) return;
    setBusyId('profile');
    try {
      const response = await familySafetyService.deleteProfile(profileId);
      onDeleted(response.message);
    } catch (err) {
      showBanner('error', getApiErrorMessage(err, 'The profile could not be deleted.'));
      setBusyId(null);
    }
  };

  const handleDeleteItem = async (kind, id, label) => {
    if (!confirm(`Remove ${label} from this profile?`)) return;
    setBusyId(id);
    try {
      let response;
      if (kind === 'medication') response = await familySafetyService.deleteMedication(profileId, id);
      if (kind === 'allergy') response = await familySafetyService.deleteAllergy(profileId, id);
      if (kind === 'condition') response = await familySafetyService.deleteCondition(profileId, id);
      showBanner('success', response.message);
      await load(true);
    } catch (err) {
      showBanner('error', getApiErrorMessage(err, 'The record could not be removed.'));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-teal-700 animate-spin" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-red-700 mb-4">{error || 'Safety profile not found.'}</p>
        <button onClick={onBack} className="px-5 py-2.5 bg-white border border-red-200 text-red-700 text-xs font-bold rounded-xl hover:bg-red-50 transition">
          Back to Profiles
        </button>
      </div>
    );
  }

  const { profile, allergies, medications, conditions, specialConsiderations, snapshot, flags, lastUpdated } = overview;
  const medicineAllergies = allergies.filter((a) => !a.allergyType || a.allergyType === 'medicine');
  const otherAllergies = allergies.filter((a) => a.allergyType && a.allergyType !== 'medicine');
  const displayAge = profile.resolvedAge != null ? profile.resolvedAge : profile.age;

  const stats = [
    { label: 'Current Medicines', value: snapshot.medicationCount, icon: Pill, color: 'text-teal-700 bg-teal-50' },
    { label: 'Allergies', value: snapshot.allergyCount, icon: ShieldAlert, color: 'text-red-700 bg-red-50' },
    { label: 'Health Conditions', value: snapshot.conditionCount, icon: HeartPulse, color: 'text-amber-700 bg-amber-50' },
    { label: 'Special Considerations', value: snapshot.specialConsiderationCount, icon: Baby, color: 'text-sky-700 bg-sky-50' }
  ];

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-3xl p-6 text-white shadow-lg border border-teal-500/20">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <button
              onClick={onBack}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition flex-shrink-0"
              title="Back to all profiles"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-400/30">
                  Safety Profile
                </span>
                {lastUpdated && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last updated {formatters.formatDate(lastUpdated)}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">{profile.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {profile.relation}
                {displayAge != null ? ` • ${displayAge} years old` : ''}
                {profile.sex ? ` • ${profile.sex === 'male' ? 'Male' : profile.sex === 'female' ? 'Female' : 'Other'}` : ''}
                {profile.dateOfBirth ? ` • DOB ${formatters.formatDate(profile.dateOfBirth)}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowEditProfile(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Info
            </button>
            <button
              onClick={handleDeleteProfile}
              disabled={busyId === 'profile'}
              className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {busyId === 'profile' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Operation banner */}
      {banner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-start gap-2 ${
            banner.type === 'error' ? 'bg-red-50 border-red-200 text-red-700'
              : banner.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {banner.type === 'error'
            ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            : banner.type === 'warning'
              ? <ShieldQuestion className="w-4 h-4 flex-shrink-0 mt-0.5" />
              : <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          {banner.text}
        </motion.div>
      )}

      {/* SAFETY SNAPSHOT */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* SAFETY FLAGS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Flag className="w-5 h-5 text-teal-700" />
          <h3 className="font-extrabold text-base text-slate-900">Safety Flags</h3>
          <span className="text-[11px] text-slate-400 font-semibold">Auto-generated from recorded information</span>
        </div>
        {flags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {flags.map((flag, i) => {
              const sev = getSeverityStyle(flag.severity);
              return (
                <span key={i} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[11px] font-extrabold border ${sev.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                  {flag.label}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl p-4">
            No safety flags yet. Flags appear automatically when allergies, conditions or special
            considerations are recorded — they describe safety factors, never a diagnosis.
          </p>
        )}
      </div>

      {/* CURRENT MEDICATIONS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-700" />
            <h3 className="font-extrabold text-base text-slate-900">Current Medicines</h3>
          </div>
          <button
            onClick={() => setShowAddMedication(true)}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-700/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Medicine
          </button>
        </div>

        {medications.length > 0 ? (
          <div className="space-y-2.5">
            {medications.map((med) => {
              const verified = med.medicineId != null;
              return (
                <div key={med.id} className="border border-slate-100 rounded-2xl p-4 flex items-start justify-between gap-3 hover:border-slate-200 transition">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">{med.brandName}</span>
                      {verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <BadgeCheck className="w-3 h-3" /> Directory verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                          <ShieldQuestion className="w-3 h-3" /> Not verified in directory
                        </span>
                      )}
                    </div>
                    {med.genericName && <div className="text-[11px] text-slate-500 mt-0.5">Active ingredient: {med.genericName}</div>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[11px] text-slate-600 font-semibold">
                      {med.strength && <span>Strength: {med.strength}</span>}
                      {med.frequency && <span>Frequency: {med.frequency}</span>}
                      {med.reason && <span>For: {med.reason}</span>}
                      {med.startDate && <span>Started: {formatters.formatDate(med.startDate)}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteItem('medication', med.id, med.brandName)}
                    disabled={busyId === med.id}
                    className="p-1.5 text-slate-300 hover:text-red-600 transition rounded-lg flex-shrink-0"
                    title="Remove medicine"
                  >
                    {busyId === med.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl p-4">
            No current medicines recorded. Adding them enables interaction and duplicate-ingredient checks.
          </p>
        )}
      </div>

      {/* ALLERGIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-base text-slate-900">Medication Allergies</h3>
            </div>
            <button
              onClick={() => setShowAddAllergy(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {medicineAllergies.length > 0 ? (
            <div className="space-y-2">
              {medicineAllergies.map((allergy) => {
                const sev = getSeverityStyle(allergy.severity);
                return (
                  <div key={allergy.id} className="border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">{allergy.allergen}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border flex-shrink-0 ${sev.badge}`}>{sev.label}</span>
                      </div>
                      {allergy.notes && <div className="text-[11px] text-slate-500 mt-0.5 truncate">{allergy.notes}</div>}
                    </div>
                    <button
                      onClick={() => handleDeleteItem('allergy', allergy.id, `${allergy.allergen} allergy`)}
                      disabled={busyId === allergy.id}
                      className="p-1.5 text-slate-300 hover:text-red-600 transition rounded-lg flex-shrink-0"
                      title="Remove allergy"
                    >
                      {busyId === allergy.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              No medicine allergies recorded. Recorded allergies (including cross-reactive families like Penicillins) trigger the strongest safety alerts.
            </p>
          )}

          {otherAllergies.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">Other Allergies (food / other)</div>
              <div className="space-y-2">
                {otherAllergies.map((allergy) => {
                  const sev = getSeverityStyle(allergy.severity);
                  return (
                    <div key={allergy.id} className="border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold text-slate-900 truncate">{allergy.allergen}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex-shrink-0">{allergy.allergyType}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border flex-shrink-0 ${sev.badge}`}>{sev.label}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteItem('allergy', allergy.id, `${allergy.allergen} allergy`)}
                        disabled={busyId === allergy.id}
                        className="p-1.5 text-slate-300 hover:text-red-600 transition rounded-lg flex-shrink-0"
                      >
                        {busyId === allergy.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* HEALTH CONDITIONS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-base text-slate-900">Health Conditions</h3>
            </div>
            <button
              onClick={() => setShowAddCondition(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {conditions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {conditions.map((condition) => {
                const sev = getSeverityStyle(condition.severity);
                return (
                  <div key={condition.id} className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-extrabold border ${sev.badge}`}>
                    {condition.conditionName}
                    <button
                      onClick={() => handleDeleteItem('condition', condition.id, condition.conditionName)}
                      disabled={busyId === condition.id}
                      className="opacity-60 hover:opacity-100 transition"
                      title="Remove condition"
                    >
                      {busyId === condition.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              No health conditions recorded. Conditions such as kidney disease or asthma enable condition-specific medicine cautions.
            </p>
          )}

          {/* SPECIAL CONSIDERATIONS */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Baby className="w-4 h-4 text-sky-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Special Considerations</h4>
            </div>
            {specialConsiderations.length > 0 ? (
              <div className="space-y-2">
                {specialConsiderations.map((sc, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600 bg-sky-50/60 border border-sky-100 rounded-2xl p-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">{sc.label}:</span> {sc.detail}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                None identified. Pregnancy, breastfeeding and age-related considerations appear here automatically from the profile info.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* EMERGENCY INFORMATION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-base text-slate-900">Emergency Information</h3>
          </div>
          <button
            onClick={() => setShowEditProfile(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
        {(profile.emergencyContactName || profile.emergencyContactPhone || profile.emergencyNotes) ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {profile.emergencyContactName && (
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 mb-1">Contact</div>
                <div className="text-sm font-bold text-slate-800">{profile.emergencyContactName}</div>
              </div>
            )}
            {profile.emergencyContactPhone && (
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 mb-1">Phone</div>
                <div className="text-sm font-bold text-slate-800">{profile.emergencyContactPhone}</div>
              </div>
            )}
            {profile.emergencyNotes && (
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 sm:col-span-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-700 mb-1">Notes</div>
                <div className="text-sm font-semibold text-slate-700">{profile.emergencyNotes}</div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            No emergency contact recorded yet. Add one via Edit Info.
          </p>
        )}
      </div>

      {/* Modals */}
      {showAddMedication && (
        <AddMedicationModal
          profileId={profile.id}
          profileName={profile.name}
          onClose={() => setShowAddMedication(false)}
          onAdded={(response) => {
            showBanner(response.identified === false ? 'warning' : 'success', response.message);
            load(true);
          }}
        />
      )}
      {showAddAllergy && (
        <AddAllergyModal
          profileId={profile.id}
          profileName={profile.name}
          onClose={() => setShowAddAllergy(false)}
          onAdded={(response) => {
            const extras = [];
            if (response.duplicates?.length) extras.push(`Duplicates skipped: ${response.duplicates.join(', ')}.`);
            if (response.errors?.length) extras.push(response.errors.join(' '));
            showBanner('success', [response.message, ...extras].filter(Boolean).join(' '));
            load(true);
          }}
        />
      )}
      {showAddCondition && (
        <AddConditionModal
          profileId={profile.id}
          profileName={profile.name}
          onClose={() => setShowAddCondition(false)}
          onAdded={(response) => {
            const extras = [];
            if (response.duplicates?.length) extras.push(`Duplicates skipped: ${response.duplicates.join(', ')}.`);
            if (response.errors?.length) extras.push(response.errors.join(' '));
            showBanner('success', [response.message, ...extras].filter(Boolean).join(' '));
            load(true);
          }}
        />
      )}
      {showEditProfile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditProfile(false)}
          onSaved={(response) => {
            showBanner('success', response.message);
            load(true);
          }}
        />
      )}
    </div>
  );
}
