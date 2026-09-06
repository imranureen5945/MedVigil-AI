import { AlertTriangle, ArrowRight, ShieldCheck, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// One-tap symptom chips — tapping adds the symptom to the description, it
// never auto-submits, because the flow is a guided multi-step assessment.
const SYMPTOM_CHIPS = [
  'Fever',
  'Sore throat',
  'Cough',
  'Vomiting',
  'Diarrhea',
  'Headache',
  'Body pain',
  'Acidity',
  'Cold / flu'
];

export default function SymptomsStep({
  vaultProfiles,
  selectedProfileId,
  onSelectProfile,
  symptoms,
  onSymptomsChange,
  loading,
  onStart
}) {
  const selectedProfile = vaultProfiles.find((p) => String(p.id) === String(selectedProfileId));

  const appendChip = (label) => {
    const text = symptoms ? symptoms.trim() : '';
    onSymptomsChange(text ? `${text}, ${label.toLowerCase()}` : label);
  };

  return (
    <div className="space-y-6">
      {/* 1. Who is this assessment for? */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-700" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Who is this assessment for?
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">
            Saved allergies, medicines and conditions are used automatically — never re-asked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vaultProfiles.map((profile) => {
            const active = String(profile.id) === String(selectedProfileId);
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => onSelectProfile(profile.id)}
                className={`px-4 py-3 rounded-2xl text-left border transition ${
                  active
                    ? 'bg-teal-700 border-teal-700 text-white shadow-md shadow-teal-700/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700'
                }`}
              >
                <div className="font-extrabold text-sm">{profile.name}</div>
                <div className={`text-[10px] font-semibold ${active ? 'text-teal-100' : 'text-slate-400'}`}>
                  {profile.relation}{profile.age != null ? ` • ${profile.age} yrs` : ''}
                  {' • '}{profile.snapshot?.allergyCount ?? 0} allergies • {profile.snapshot?.medicationCount ?? 0} medicines
                </div>
              </button>
            );
          })}
        </div>

        {selectedProfile ? (
          <p className="text-[11px] text-teal-800 font-semibold bg-teal-50 border border-teal-100 rounded-xl p-3 flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <span>
              Every check will run against <strong>{selectedProfile.name}</strong>&apos;s saved safety
              profile — recorded allergies, current medicines and health conditions are applied automatically.
            </span>
          </p>
        ) : (
          <p className="text-[11px] text-amber-800 font-semibold bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>Select a family profile to continue — the safety check needs a verified safety profile.</span>
          </p>
        )}
      </div>

      {/* 2. Describe the symptoms */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-med-navy to-slate-950 border border-sea-green/30 shadow-2xl text-white space-y-5 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-sea-light flex items-center gap-2">
            <Zap size={14} className="text-sea-light" />
            Describe the symptoms:
          </label>
          <span className="text-[11px] text-slate-400 font-semibold">English / Roman Urdu</span>
        </div>

        <textarea
          rows={4}
          className="w-full p-4 sm:p-5 bg-slate-950/80 border-2 border-slate-700/80 focus:border-sea-light rounded-2xl focus:bg-slate-950 focus:ring-4 focus:ring-sea-light/20 outline-none resize-none text-white placeholder-slate-500 text-xs sm:text-sm leading-relaxed transition shadow-inner font-medium"
          placeholder="e.g. bukhar hai, gala dard aur ulti aa rahi hai... or: Fever, sore throat and vomiting since yesterday..."
          value={symptoms}
          onChange={(e) => onSymptomsChange(e.target.value)}
        />

        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Quick add (tap to include):
          </span>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_CHIPS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => appendChip(label)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-sea-green hover:text-white text-slate-300 border border-white/10 hover:border-sea-light transition duration-200"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-slate-400 font-medium">
            Roman Urdu is understood — <span className="text-slate-300">bukhar, ulti, dast, gala dard, khansi</span> and more.
          </span>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading || !selectedProfileId || !symptoms.trim()}
            onClick={onStart}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm text-white shadow-xl transition flex items-center justify-center gap-2.5 ${
              loading || !selectedProfileId || !symptoms.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700'
                : 'bg-gradient-to-r from-sea-green via-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-sea-green/30'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Understanding your symptoms...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
