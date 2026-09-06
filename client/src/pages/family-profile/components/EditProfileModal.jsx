import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Pencil, Loader2, Info } from 'lucide-react';
import { familySafetyService, getApiErrorMessage } from '../../../services/familySafetyService';
import { RELATION_OPTIONS, STATUS_OPTIONS } from './severityStyles';

/**
 * Edit a profile's basic safety information (PATCH semantics — only the
 * fields present are changed on the server). Used for identity corrections,
 * pregnancy/breastfeeding status changes and emergency contact updates.
 */
export default function EditProfileModal({ profile, onClose, onSaved }) {
  const [name, setName] = useState(profile.name || '');
  const [relation, setRelation] = useState(profile.relation || 'Self');
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth || '');
  const [age, setAge] = useState(profile.age != null ? String(profile.age) : '');
  const [sex, setSex] = useState(profile.sex || '');
  const [pregnancyStatus, setPregnancyStatus] = useState(profile.pregnancyStatus || 'unknown');
  const [breastfeedingStatus, setBreastfeedingStatus] = useState(profile.breastfeedingStatus || 'unknown');
  const [emergencyContactName, setEmergencyContactName] = useState(profile.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile.emergencyContactPhone || '');
  const [emergencyNotes, setEmergencyNotes] = useState(profile.emergencyNotes || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const showFemaleStatus = sex === 'female';

  const handleSubmit = async () => {
    if (name.trim().length < 2) { setError('Enter the full name (at least 2 characters).'); return; }
    setSubmitting(true);
    setError('');
    try {
      const response = await familySafetyService.updateProfile(profile.id, {
        name: name.trim(),
        relation,
        dateOfBirth: dateOfBirth || null,
        age: age === '' ? null : Number(age),
        sex: sex || null,
        pregnancyStatus: showFemaleStatus ? pregnancyStatus : 'not_applicable',
        breastfeedingStatus: showFemaleStatus ? breastfeedingStatus : 'not_applicable',
        emergencyContactName: emergencyContactName.trim() || null,
        emergencyContactPhone: emergencyContactPhone.trim() || null,
        emergencyNotes: emergencyNotes.trim() || null
      });
      onSaved(response);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'The profile could not be updated. Please try again.'));
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden border border-slate-100 flex flex-col"
      >
        <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-teal-700" />
            <h2 className="font-extrabold text-base text-slate-900">Edit Safety Profile</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Relationship</label>
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
                onChange={(e) => setAge(e.target.value)} className={inputClass} />
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
                Updating these keeps medicine checks current — pregnancy cautions apply automatically.
              </p>
            </div>
          )}

          <div className="space-y-3 pt-1">
            <label className={`${labelClass} !mb-0`}>Emergency Contact</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Contact name" className={inputClass} />
              <input type="text" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="Phone (e.g. 0300-1234567)" className={inputClass} />
            </div>
            <textarea value={emergencyNotes} onChange={(e) => setEmergencyNotes(e.target.value)}
              placeholder="Emergency notes (e.g. blood group, critical instructions) — max 500 characters"
              maxLength={500} rows={2}
              className={`${inputClass} resize-none`} />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-700">{error}</div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/60">
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 font-bold text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 font-bold text-xs text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md shadow-teal-700/20 transition flex items-center gap-1.5 disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
