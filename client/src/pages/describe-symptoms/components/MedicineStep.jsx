import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bug,
  CheckCircle2,
  ChevronLeft,
  HelpCircle,
  Info,
  Pill,
  Search,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { medicineService } from '../../../services/medicineService';

const MED_STATUS_STYLES = {
  LOW: { label: 'No conflicts found', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  MODERATE: { label: 'Caution — review the findings', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  HIGH: { label: 'Do not take before a medical review', cls: 'bg-red-100 text-red-800 border-red-300' },
  UNKNOWN: { label: 'Could not verify this medicine', cls: 'bg-slate-100 text-slate-700 border-slate-300' }
};

const severityStyle = (severity) => {
  const s = String(severity || '').toLowerCase();
  if (['critical', 'high'].includes(s)) return 'bg-red-50 border-red-200 text-red-800';
  if (['moderate', 'medium'].includes(s)) return 'bg-amber-50 border-amber-200 text-amber-900';
  return 'bg-sky-50 border-sky-200 text-sky-900';
};

const PLAN_OPTIONS = [
  {
    value: 'no',
    Icon: XCircle,
    title: 'No',
    description: 'No medicine is planned — the assessment will check the symptoms and warning signs alone.'
  },
  {
    value: 'yes',
    Icon: Pill,
    title: 'Yes',
    description: 'Select or type the medicine you are thinking of taking, and it will be checked against the saved safety profile.'
  },
  {
    value: 'unsure',
    Icon: HelpCircle,
    title: 'Not sure',
    description: 'You do not need to choose a medicine to continue — the assessment still checks the symptoms and tells you when a doctor should be seen first.'
  }
];

export default function MedicineStep({
  profile,
  plan,
  onPlanChange,
  selectedMed,
  medCheck,
  medChecking,
  medError,
  onPickMedicine,
  onManualCheck,
  onBack,
  onContinue
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [manualName, setManualName] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const runSearch = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const meds = await medicineService.searchMedicines(value.trim());
      setResults(Array.isArray(meds) ? meds.slice(0, 6) : []);
      setSearching(false);
    }, 350);
  };

  const canContinue = plan === 'yes' ? Boolean(selectedMed) && !medChecking : Boolean(plan);

  return (
    <div className="space-y-6">
      {/* Plan choice */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-teal-700" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Do you plan to take a medicine for these symptoms?
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLAN_OPTIONS.map(({ value, Icon, title, description }) => {
            const active = plan === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onPlanChange(value)}
                className={`p-4 rounded-2xl text-left border-2 transition ${
                  active
                    ? 'border-teal-600 bg-teal-50 shadow-md shadow-teal-600/10'
                    : 'border-slate-200 bg-white hover:border-teal-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span className={`text-sm font-black ${active ? 'text-teal-800' : 'text-slate-700'}`}>{title}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500 font-medium">{description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Medicine picker + live safety check */}
      {plan === 'yes' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-slate-900 via-med-navy to-slate-950 border border-sea-green/30 shadow-2xl text-white space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-sea-light flex items-center gap-2">
              <Search size={14} className="text-sea-light" />
              Which medicine are you considering?
            </label>
            <span className="text-[11px] text-slate-400 font-semibold">
              We never suggest medicines — we only check what you plan to take
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); runSearch(e.target.value); }}
              placeholder="Search the medicine directory — e.g. Augmentin, Panadol, Brufen..."
              className="w-full p-4 pl-11 bg-slate-950/80 border-2 border-slate-700/80 focus:border-sea-light rounded-2xl focus:ring-4 focus:ring-sea-light/20 outline-none text-white placeholder-slate-500 text-xs sm:text-sm font-medium transition"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          {searching && (
            <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-sea-light border-t-transparent rounded-full animate-spin" />
              Searching the medicine directory...
            </p>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((med) => {
                const active = String(selectedMed?.id) === String(med.id);
                return (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => {
                      setQuery(med.brandName);
                      setResults([]);
                      onPickMedicine({ id: med.id, name: med.brandName, genericName: med.genericName, category: med.category });
                    }}
                    className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition text-left ${
                      active
                        ? 'border-sea-light bg-sea-green/20'
                        : 'border-white/10 bg-slate-800/60 hover:border-sea-light/60 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-extrabold text-white">{med.brandName}</div>
                      <div className="text-[11px] text-slate-400 font-semibold">{med.genericName}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {med.recallStatus === 1 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-400/40">
                          DRAP RECALL
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-950/60 text-slate-300 border border-white/10">
                        {med.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Manual entry fallback */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Cannot find it? Type the name instead:
            </span>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Medicine name as written on the pack"
                className="flex-1 p-3.5 bg-slate-950/80 border-2 border-slate-700/80 focus:border-sea-light rounded-2xl outline-none text-white placeholder-slate-500 text-xs sm:text-sm font-medium transition"
              />
              <button
                type="button"
                disabled={manualName.trim().length < 2 || medChecking}
                onClick={() => onManualCheck({ id: null, name: manualName.trim(), manual: true })}
                className={`px-5 py-3.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 ${
                  manualName.trim().length < 2 || medChecking
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-sea-green to-teal-600 text-white shadow-lg shadow-sea-green/30 hover:from-teal-600'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Check this medicine</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Manually entered medicines are checked by name — if the name cannot be verified, the assessment
              treats their safety as unknown instead of guessing.
            </p>
          </div>
        </motion.div>
      )}

      {/* Live medication safety preview */}
      {plan === 'yes' && selectedMed && (
        <MedicationCheckPreview
          profile={profile}
          selectedMed={selectedMed}
          medCheck={medCheck}
          medChecking={medChecking}
          medError={medError}
        />
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-400 bg-white transition flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to questions</span>
        </button>
        <motion.button
          type="button"
          whileHover={{ scale: canContinue ? 1.03 : 1 }}
          whileTap={{ scale: canContinue ? 0.97 : 1 }}
          disabled={!canContinue}
          onClick={onContinue}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2.5 ${
            canContinue
              ? 'bg-gradient-to-r from-sea-green via-teal-600 to-emerald-600 text-white shadow-xl shadow-sea-green/30'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          <span>Run Safety Assessment</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

function MedicationCheckPreview({ profile, selectedMed, medCheck, medChecking, medError }) {
  if (medChecking) {
    return (
      <div className="bg-white/95 rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-700">Checking the medicine you selected...</p>
      </div>
    );
  }

  if (medError) {
    return (
      <div className="bg-white/95 rounded-3xl border-2 border-amber-200 p-5 shadow-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 font-semibold leading-relaxed">
          {medError} The final assessment will re-check this medicine before finishing.
        </p>
      </div>
    );
  }

  if (!medCheck) return null;

  const { medicationSafety, amrAlert } = medCheck;
  const status = MED_STATUS_STYLES[medicationSafety?.status] || MED_STATUS_STYLES.UNKNOWN;
  const alerts = medicationSafety?.alerts || [];
  const identified = medicationSafety?.details?.identified;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            Safety check: {selectedMed.name}
          </h4>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
            Checked against {profile?.name || 'the selected profile'}&apos;s saved safety information
          </p>
        </div>
        <span className={`self-start px-3 py-1 rounded-xl text-[11px] font-black border ${status.cls}`}>
          {status.label}
        </span>
      </div>

      {!identified && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            This medicine could not be verified against the medicine directory — its safety for this profile
            is treated as unknown instead of being guessed.
          </span>
        </div>
      )}

      {identified && alerts.length === 0 && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            No allergy, interaction or condition conflicts were found with the saved safety information for{' '}
            {profile?.name || 'this profile'}.
          </span>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border text-xs leading-relaxed font-medium ${severityStyle(alert.severity)}`}
            >
              <div className="font-black mb-0.5">{alert.title}</div>
              <div>{alert.message}</div>
            </div>
          ))}
        </div>
      )}

      {amrAlert && (
        <div className="p-4 sm:p-5 rounded-2xl bg-orange-50 border-2 border-orange-300 space-y-2.5">
          <h5 className="text-xs font-black text-orange-900 flex items-center gap-2">
            <Bug className="w-4 h-4 text-orange-600" />
            🦠 {amrAlert.title}
          </h5>
          <p className="text-[11px] font-bold text-orange-800">
            {amrAlert.medicine?.name} ({amrAlert.medicine?.genericName}) is an antibiotic.
          </p>
          <ul className="space-y-1.5">
            {amrAlert.messages.map((message, i) => (
              <li key={i} className="text-[11px] text-orange-900 font-medium flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <span>{message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
