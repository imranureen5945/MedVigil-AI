import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, UserPlus, HeartPulse, ShieldAlert, ArrowLeft, ArrowRight,
  Loader2, CheckCircle2, Info
} from 'lucide-react';
import { familySafetyService, getApiErrorMessage } from '../../../services/familySafetyService';
import ConditionChips from './ConditionChips';
import AllergyPicker from './AllergyPicker';
import { RELATION_OPTIONS, STATUS_OPTIONS } from './severityStyles';

const STEPS = [
  { id: 1, label: 'Basic Info', icon: UserPlus },
  { id: 2, label: 'Health Conditions', icon: HeartPulse },
  { id: 3, label: 'Allergies', icon: ShieldAlert }
];

/**
 * 3-step profile creation wizard:
 *   Step 1 — basic identity info (name, relation, DOB/age, sex, special status, emergency contact)
 *   Step 2 — health conditions as selectable chips
 *   Step 3 — allergies (searchable medicine directory + manual entry)
 * Everything gathered here feeds the central safety data layer, so later
 * medicine checks never re-ask for this information.
 */
export default function CreateProfileWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — basic info
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Self');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [pregnancyStatus, setPregnancyStatus] = useState('unknown');
  const [breastfeedingStatus, setBreastfeedingStatus] = useState('unknown');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Step 2 — conditions (names only; the server maps them to safety keys)
  const [conditions, setConditions] = useState([]);

  // Step 3 — allergies
  const [allergies, setAllergies] = useState([]);

  const showFemaleStatus = sex === 'female';

  const validateStep = () => {
    if (step === 1) {
      if (name.trim().length < 2) return 'Enter the full name (at least 2 characters).';
      if (!relation) return 'Select the relationship.';
      if (dateOfBirth) {
        const dob = new Date(dateOfBirth);
        if (isNaN(dob.getTime()) || dob > new Date()) return 'Date of birth must be a valid date in the past.';
      }
      if (age !== '' && (Number(age) < 0 || Number(age) > 120 || isNaN(Number(age)))) {
        return 'Age must be between 0 and 120.';
      }
      if (!dateOfBirth && age === '') {
        return 'Enter either the date of birth or the age.';
      }
    }
    return '';
  };

  const handleNext = () => {
    const validation = validateStep();
    if (validation) { setError(validation); return; }
    setError('');
    setStep((s) => Math.min(3, s + 1));
  };

  const handleBack = () => {
    setError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const toggleCondition = (conditionName) => {
    setConditions((prev) =>
      prev.includes(conditionName)
        ? prev.filter((c) => c !== conditionName)
        : [...prev, conditionName]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const response = await familySafetyService.createProfile({
        name: name.trim(),
        relation,
        dateOfBirth: dateOfBirth || null,
        age: age === '' ? null : Number(age),
        sex: sex || null,
        pregnancyStatus: showFemaleStatus ? pregnancyStatus : 'not_applicable',
        breastfeedingStatus: showFemaleStatus ? breastfeedingStatus : 'not_applicable',
        emergencyContactName: emergencyContactName.trim() || null,
        emergencyContactPhone: emergencyContactPhone.trim() || null,
        conditions: conditions.map((conditionName) => ({ conditionName })),
        allergies: allergies.map(({ allergen, allergyType, severity }) => ({ allergen, allergyType, severity }))
      });
      onCreated(response);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'The profile could not be created. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5';

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden border border-slate-100 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-teal-700" />
            <h2 className="font-extrabold text-base text-slate-900">New Safety Profile</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-5 pb-1">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = step === s.id;
              const done = step > s.id;
              return (
                <React.Fragment key={s.id}>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold transition ${
                    active ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                      : done ? 'bg-teal-50 text-teal-700 border border-teal-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.id}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${step > s.id ? 'bg-teal-500' : 'bg-slate-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mother / Son / Daughter" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Relationship *</label>
                  <select value={relation} onChange={(e) => setRelation(e.target.value)} className={inputClass}>
                    {RELATION_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Sex</label>
                  <select value={sex} onChange={(e) => setSex(e.target.value)} className={inputClass}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" value={dateOfBirth} max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Age (if DOB unknown)</label>
                  <input type="number" min="0" max="120" value={age}
                    onChange={(e) => setAge(e.target.value)} placeholder="e.g. 62" className={inputClass} />
                </div>
              </div>

              {showFemaleStatus && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-teal-50/70 rounded-2xl border border-teal-100">
                  <div>
                    <label className={labelClass}>Pregnant?</label>
                    <select value={pregnancyStatus} onChange={(e) => setPregnancyStatus(e.target.value)} className={inputClass}>
                      {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Breastfeeding?</label>
                    <select value={breastfeedingStatus} onChange={(e) => setBreastfeedingStatus(e.target.value)} className={inputClass}>
                      {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <p className="col-span-full text-[11px] text-teal-800 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    Medicine checks will automatically include pregnancy and breastfeeding safety information for this profile.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Emergency Contact (optional)</label>
                  <input type="text" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="Contact name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Emergency Phone (optional)</label>
                  <input type="text" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="e.g. 0300-1234567" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Select any ongoing health conditions. These are used for medicine safety checks —
                for example, kidney disease changes how some painkillers should be used.
              </p>
              <ConditionChips selected={conditions} onToggle={toggleCondition} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Record any known <strong>medicine allergies</strong> — these trigger the strongest
                safety alerts (e.g. a Penicillin allergy flags Amoxicillin and related medicines).
                Food and other allergies can also be recorded.
              </p>
              <AllergyPicker selected={allergies} onChange={setAllergies} />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || submitting}
            className="px-5 py-2.5 font-bold text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          <span className="text-[11px] font-bold text-slate-400">Step {step} of 3</span>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md shadow-teal-700/20 transition flex items-center gap-1.5"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md shadow-teal-700/20 transition flex items-center gap-1.5 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              {submitting ? 'Creating...' : 'Create Safety Profile'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
