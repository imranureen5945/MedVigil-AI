import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bug,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Info,
  Lock,
  MessageCircle,
  Pill,
  RotateCcw,
  Search,
  ShieldCheck,
  Thermometer,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getTriageRiskStyle } from './triageRiskStyles';

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

function SectionCard({ icon: Icon, title, children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-4 ${className}`}
    >
      <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
        <Icon className="w-4 h-4 text-teal-700" />
        {title}
      </h4>
      {children}
    </motion.div>
  );
}

export default function ResultStep({ result, onRestart, onConsultDoctor }) {
  const risk = getTriageRiskStyle(result.riskLevel);
  const RiskIcon = risk.Icon;
  const isRed = result.riskLevel === 'RED' || (result.redFlags?.length || 0) > 0;
  const plannedMedicineChecked = result.plannedMedicine?.plan === 'yes' && result.medicationSafety;
  const medStatus = plannedMedicineChecked
    ? MED_STATUS_STYLES[result.medicationSafety.status] || MED_STATUS_STYLES.UNKNOWN
    : null;
  const showDoctorCta = result.doctorConnectRecommended || isRed;

  return (
    <div className="space-y-6">
      {/* RED — urgent banner, always at the very top */}
      {isRed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-red-600 border-2 border-red-500 shadow-xl text-white space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-white">🔴 URGENT MEDICAL ATTENTION RECOMMENDED</h3>
              <p className="text-sm text-red-100 font-medium">
                Warning signs were detected — do not self-medicate and do not wait.
              </p>
            </div>
          </div>
          {result.redFlags?.length > 0 && (
            <div className="space-y-1.5 pl-2">
              {result.redFlags.map((flag, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white font-bold">
                  <AlertTriangle className="w-4 h-4 text-yellow-300" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-red-100 font-medium">
            Call emergency services (1122 / Rescue 1122) or go to the nearest hospital immediately.
            No routine medicine recommendations apply to this situation.
          </p>
          <button
            onClick={onConsultDoctor}
            className="mt-1 px-6 py-3 rounded-2xl bg-white text-red-700 font-black text-sm shadow-lg hover:bg-red-50 transition flex items-center gap-2"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Connect to Emergency Doctor Now</span>
          </button>
        </motion.div>
      )}

      {/* YOUR ASSESSMENT */}
      <SectionCard icon={ClipboardList} title="Your Assessment">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <p className="text-[11px] text-slate-400 font-bold">{result.profile?.assessingFor}</p>
          {result.assessmentId != null && (
            <span className="text-[10px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg self-start">
              Assessment #{result.assessmentId}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">{result.summary}</p>

        {result.aiNotice && (
          <p className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-semibold flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>{result.aiNotice}</span>
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {(result.normalizedSymptoms || []).map((s, i) => (
            <span key={i} className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
              {s.label}
            </span>
          ))}
          {result.durationSummary && (
            <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {result.durationSummary}
            </span>
          )}
          {result.temperatureC != null && (
            <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <Thermometer className="w-3 h-3" /> Highest temperature {result.temperatureC.toFixed(1)}°C
            </span>
          )}
          {result.plannedMedicine?.plan === 'yes' && result.plannedMedicine?.medicine && (
            <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1.5">
              <Pill className="w-3 h-3" /> Planned: {result.plannedMedicine.medicine.name}
              {result.plannedMedicine.medicine.identified ? '' : ' (not verified)'}
            </span>
          )}
        </div>

        {result.safetyOverride && (
          <p className="p-3.5 bg-slate-900 text-white rounded-xl text-[11px] font-bold flex items-start gap-2">
            <Lock className="w-4 h-4 text-sea-light shrink-0 mt-0.5" />
            <span>
              Verified safety findings were used for this result — the AI layer can only raise this risk
              level, never lower it or remove an alert.
            </span>
          </p>
        )}
      </SectionCard>

      {/* RISK LEVEL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-3xl p-6 sm:p-8 shadow-lg space-y-3 ${risk.panel}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${risk.gradient} flex items-center justify-center shadow-lg shrink-0`}>
            <RiskIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Risk Level</p>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">{result.riskLevel} — {risk.label}</h3>
          </div>
        </div>
        <p className="text-xs sm:text-sm font-semibold leading-relaxed">{risk.meaning}</p>
      </motion.div>

      {/* WHAT WE FOUND */}
      <SectionCard icon={Search} title="What We Found — Why This Result">
        <ol className="space-y-2.5">
          {result.reasons?.map((reason, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-slate-700 font-medium leading-relaxed">
              <span className="w-5 h-5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{reason}</span>
            </li>
          ))}
        </ol>
      </SectionCard>

      {/* MEDICATION SAFETY */}
      {plannedMedicineChecked && (
        <SectionCard icon={Pill} title="Medication Safety">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-black text-slate-800">
                {result.medicationSafety.details?.medicine?.name || result.plannedMedicine?.medicine?.name}
              </p>
              {result.medicationSafety.details?.medicine?.genericName && (
                <p className="text-[11px] text-slate-500 font-semibold">
                  {result.medicationSafety.details.medicine.genericName}
                  {result.medicationSafety.details.medicine.category
                    ? ` • ${result.medicationSafety.details.medicine.category}`
                    : ''}
                </p>
              )}
            </div>
            <span className={`self-start px-3 py-1 rounded-xl text-[11px] font-black border ${medStatus.cls}`}>
              {medStatus.label}
            </span>
          </div>

          {!result.medicationSafety.details?.identified && (
            <p className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                This medicine could not be verified against the medicine directory — its safety for this
                profile is treated as unknown instead of being guessed.
              </span>
            </p>
          )}

          {result.medicationSafety.alerts?.length > 0 ? (
            <div className="space-y-2.5">
              {result.medicationSafety.alerts.map((alert, i) => (
                <div key={i} className={`p-3.5 rounded-xl border text-xs leading-relaxed font-medium ${severityStyle(alert.severity)}`}>
                  <div className="font-black mb-0.5">{alert.title}</div>
                  <div>{alert.message}</div>
                </div>
              ))}
            </div>
          ) : result.medicationSafety.details?.identified ? (
            <p className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                No allergy, interaction or condition conflicts were found with the saved safety information
                for this profile.
              </span>
            </p>
          ) : null}
        </SectionCard>
      )}

      {/* ANTIBIOTIC SAFETY (only when relevant) */}
      {result.amrAlert && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 sm:p-7 bg-orange-50 border-2 border-orange-300 shadow-sm space-y-3"
        >
          <h4 className="text-xs font-black text-orange-900 flex items-center gap-2">
            <Bug className="w-4 h-4 text-orange-600" />
            🦠 {result.amrAlert.title}
          </h4>
          <p className="text-xs font-black text-orange-800">
            {result.amrAlert.medicine?.name} ({result.amrAlert.medicine?.genericName}) is an antibiotic.
          </p>
          <ul className="space-y-2">
            {result.amrAlert.messages?.map((message, i) => (
              <li key={i} className="text-xs text-orange-900 font-medium leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>{message}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* WARNING SIGNS */}
      {result.warningSigns?.length > 0 && (
        <SectionCard icon={AlertTriangle} title="Warning Signs — Watch For These">
          <ul className="space-y-2">
            {result.warningSigns.map((sign, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-amber-900 font-semibold leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* WHAT YOU CAN DO NOW */}
      {result.selfCareGuidance?.length > 0 && (
        <SectionCard icon={CheckCircle2} title="What You Can Do Now">
          <ul className="space-y-2">
            {result.selfCareGuidance.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-slate-400 font-medium pt-1">
            General self-care only — this is not a treatment plan or a prescription.
          </p>
        </SectionCard>
      )}

      {/* WHEN TO SEEK MEDICAL HELP */}
      {result.nextSteps?.length > 0 && (
        <SectionCard icon={ShieldCheck} title="When to Seek Medical Help">
          <ul className="space-y-2">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold leading-relaxed">
                <ArrowRight className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* CONNECT WITH A DOCTOR */}
      {showDoctorCta ? (
        <div className="p-6 bg-gradient-to-r from-med-dark via-slate-900 to-med-navy rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl border border-white/10">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-black text-base sm:text-lg text-white flex items-center justify-center sm:justify-start gap-2">
              <MessageCircle className="w-5 h-5 text-sea-light" />
              Connect With a Doctor
            </h4>
            <p className="text-xs text-slate-300 max-w-xl font-normal leading-relaxed">
              A verified doctor can review these symptoms together with the saved family safety information —
              before any medicine is taken.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onConsultDoctor}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-sea-green to-teal-600 hover:from-teal-600 hover:to-sea-green text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            <span>Consult Doctor Now</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      ) : (
        <button
          onClick={onConsultDoctor}
          className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-teal-700 hover:border-teal-400 transition flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Still unsure? A verified doctor is available anytime via Doctor Connect.</span>
        </button>
      )}

      {/* Disclaimers */}
      <div className="p-5 bg-slate-100 border border-slate-200 rounded-3xl text-[11px] text-slate-600 leading-relaxed font-medium space-y-2">
        <p><strong className="text-slate-800">Disclaimer:</strong> {result.disclaimer}</p>
        <p dir="rtl" className="text-right text-slate-600">{result.urduDisclaimer}</p>
      </div>

      {/* Actions */}
      <div className="flex justify-center pb-2">
        <button
          onClick={onRestart}
          className="px-8 py-3.5 rounded-2xl bg-white border-2 border-slate-200 hover:border-teal-400 text-xs font-black text-slate-700 hover:text-teal-700 transition flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start a New Assessment</span>
        </button>
      </div>
    </div>
  );
}
