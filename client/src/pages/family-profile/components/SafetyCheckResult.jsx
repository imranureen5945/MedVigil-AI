import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Siren, Repeat, Stethoscope, Baby, Hourglass,
  Info, ShieldCheck, ShieldAlert, HelpCircle, UserCheck,
  CheckCircle2, Link2, Sparkles
} from 'lucide-react';
import { getSeverityStyle, getRiskStyle } from './severityStyles';

const ALERT_SECTIONS = [
  { key: 'allergyAlerts', title: 'Allergy Alerts', icon: Siren, style: 'border-red-200 bg-red-50/60' },
  { key: 'interactionAlerts', title: 'Interaction Alerts', icon: AlertTriangle, style: 'border-orange-200 bg-orange-50/60' },
  { key: 'duplicateIngredientAlerts', title: 'Duplicate Active Ingredients', icon: Repeat, style: 'border-amber-200 bg-amber-50/60' },
  { key: 'conditionWarnings', title: 'Condition-Specific Cautions', icon: Stethoscope, style: 'border-amber-200 bg-amber-50/60' },
  { key: 'pregnancyWarnings', title: 'Pregnancy & Breastfeeding Cautions', icon: Baby, style: 'border-purple-200 bg-purple-50/60' },
  { key: 'ageRelatedCautions', title: 'Age-Related Cautions', icon: Hourglass, style: 'border-sky-200 bg-sky-50/60' },
  { key: 'otherSafetyInfo', title: 'Other Safety Information', icon: Info, style: 'border-slate-200 bg-slate-50/60' }
];

/**
 * Renders the structured medication safety result returned by the server
 * engine. The layout mirrors the vault spec exactly:
 *  - prominent "Checking safety for: [PROFILE NAME]"
 *  - overall risk LOW | MODERATE | HIGH | UNKNOWN (never "safe")
 *  - each alert category with severity
 *  - the professional-advice disclaimer always visible
 */
export default function SafetyCheckResult({ result, checkingFor }) {
  if (!result) return null;

  const risk = getRiskStyle(result.overallRisk);
  const hasAnyAlert = ALERT_SECTIONS.some((s) => (result[s.key] || []).length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Header — medicine + overall risk */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-300 mb-1">
              Medication Safety Check
            </div>
            <h3 className="text-xl font-extrabold truncate">{result.medicine?.name || 'Unknown medicine'}</h3>
            {result.identified ? (
              <p className="text-xs text-slate-300 mt-1">
                {result.medicine.genericName ? `${result.medicine.genericName} • ` : ''}
                {result.medicine.manufacturer ? `${result.medicine.manufacturer} • ` : ''}
                Verified against the medicine directory
              </p>
            ) : (
              <p className="text-xs text-amber-300 mt-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Not confidently identified in the medicine directory
              </p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold border whitespace-nowrap self-start ${risk.badge}`}>
            {result.overallRisk === 'LOW'
              ? <ShieldCheck className="w-4 h-4" />
              : result.overallRisk === 'UNKNOWN'
                ? <HelpCircle className="w-4 h-4" />
                : <ShieldAlert className="w-4 h-4" />}
            {risk.label}
          </span>
        </div>
      </div>

      {/* Checking for — the profile this result belongs to */}
      <div className="px-5 py-3 bg-teal-50 border-b border-teal-100 flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-teal-700 flex-shrink-0" />
        <span className="text-xs font-bold text-teal-900">
          Checking safety for: <span className="text-teal-950 font-black">{checkingFor || result.profileName}</span>
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* AI intelligence summary — checks completed + condition links */}
        {result.identified && (result.checksCompleted?.length > 0 || result.linkedConditions?.length > 0) && (
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-800">
                AI Safety Intelligence
              </h4>
            </div>
            {result.linkedConditions?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {result.linkedConditions.map((lc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 border border-teal-300 text-teal-800"
                  >
                    <Link2 className="w-3 h-3" />
                    Linked to {lc.condition}
                  </span>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {(result.checksCompleted || []).map((check, i) => (
                <motion.div
                  key={check}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-teal-900">{check}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Summary message */}
        <div className={`p-4 rounded-2xl border text-sm font-semibold ${
          result.overallRisk === 'LOW'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : result.overallRisk === 'UNKNOWN'
              ? 'bg-slate-50 border-slate-200 text-slate-700'
              : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          {result.message}
        </div>

        {/* Alert sections */}
        {hasAnyAlert ? (
          <div className="space-y-4">
            {ALERT_SECTIONS.map((section) => {
              const alerts = result[section.key] || [];
              if (alerts.length === 0) return null;
              const Icon = section.icon;
              return (
                <div key={section.key} className={`rounded-2xl border p-4 ${section.style}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-slate-600" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">{section.title}</h4>
                  </div>
                  <div className="space-y-2.5">
                    {alerts.map((alert, i) => {
                      const sev = getSeverityStyle(alert.severity);
                      return (
                        <div key={i} className="bg-white rounded-xl border border-slate-100 p-3.5">
                          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                            <span className="text-[11px] font-extrabold text-slate-800 tracking-wide">{alert.title}</span>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${sev.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                              {sev.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          result.overallRisk === 'LOW' && (
            <div className="flex items-start gap-2.5 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                No allergy, interaction, duplicate-ingredient or condition-related concerns were identified
                from the information recorded in this profile.
              </p>
            </div>
          )
        )}

        {/* Disclaimer — always displayed, per spec */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{result.disclaimer || 'This does not replace professional medical advice.'}</span>
        </div>
      </div>
    </motion.div>
  );
}
