import { AlertOctagon, AlertTriangle, ArrowRight, CheckCircle2, ChevronLeft, HelpCircle, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

// A question is answered when it holds a real value; "not measured" counts
// as an answer for temperature (it is simply omitted from the API call).
function isAnswered(question, answers) {
  const a = answers[question.id];
  if (question.type === 'temperature') {
    return Boolean(a && (a.notMeasured || (a.value !== '' && a.value != null)));
  }
  return a !== undefined && a !== null && a !== '';
}

export default function QuestionsStep({ startData, answers, onAnswer, onBack, onContinue }) {
  const questions = startData?.questions || [];
  const answeredCount = questions.filter((q) => isAnswered(q, answers)).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  return (
    <div className="space-y-6">
      {/* Early urgent banner — red flags were already found in the description */}
      {startData?.redFlagsDetected?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-red-600 border-2 border-red-500 shadow-xl text-white space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <AlertOctagon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg sm:text-xl text-white">🔴 URGENT MEDICAL ATTENTION RECOMMENDED</h3>
              <p className="text-sm text-red-100 font-medium">
                Your description already mentions serious warning signs.
              </p>
            </div>
          </div>
          <div className="space-y-1.5 pl-2">
            {startData.redFlagsDetected.map((flag, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white font-bold">
                <AlertTriangle className="w-4 h-4 text-yellow-300" />
                <span>{flag}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-red-100 font-medium">
            Do not wait — call emergency services (1122 / Rescue 1122) or go to the nearest hospital now.
            You can still finish the assessment below, but do not self-medicate for these symptoms.
          </p>
        </motion.div>
      )}

      {/* What the system understood */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-700" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">We understood</h4>
        </div>
        {startData?.normalizedSymptoms?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {startData.normalizedSymptoms.map((s, i) => {
              const fromOtherLanguage =
                s.matchedTerm && !s.label.toLowerCase().includes(s.matchedTerm.toLowerCase());
              return (
                <span
                  key={i}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200"
                >
                  {s.label}
                  {fromOtherLanguage ? <span className="text-teal-600 font-semibold"> — from “{s.matchedTerm}”</span> : null}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-medium">
            No common symptom pattern was recognised — the questions below still apply, and a doctor&apos;s
            evaluation will be recommended.
          </p>
        )}
        <p className="text-[11px] text-slate-400 font-semibold">
          {startData?.profile?.assessingFor}
        </p>
      </div>

      {/* Adaptive questions */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-teal-700" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              A few quick questions
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">
            {answeredCount} of {questions.length} answered
          </span>
        </div>

        <div className="space-y-4">
          {questions.map((q, index) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={index}
              answer={answers[q.id]}
              onAnswer={(value) => onAnswer(q.id, value)}
            />
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 font-medium">
            These questions are tailored to the reported symptoms only.
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-400 transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Edit symptoms</span>
            </button>
            <motion.button
              type="button"
              whileHover={{ scale: allAnswered ? 1.03 : 1 }}
              whileTap={{ scale: allAnswered ? 0.97 : 1 }}
              disabled={!allAnswered}
              onClick={onContinue}
              className={`flex-1 sm:flex-none px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                allAnswered
                  ? 'bg-gradient-to-r from-sea-green via-teal-600 to-emerald-600 text-white shadow-lg shadow-sea-green/30'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ question, index, answer, onAnswer }) {
  const answered = isAnswered(question, { [question.id]: answer });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className={`p-4 sm:p-5 rounded-2xl border-2 transition ${
        answered ? 'border-teal-300 bg-teal-50/40' : 'border-slate-200 bg-slate-50/60'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
          <span className="text-slate-400 font-black mr-1.5">{index + 1}.</span>
          {question.question}
        </p>
        {answered && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />}
      </div>

      {question.type === 'temperature' ? (
        <TemperatureInput answer={answer} onAnswer={onAnswer} />
      ) : (
        <div className="flex flex-wrap gap-2">
          {(question.options || []).map((opt) => {
            const active = answer === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onAnswer(opt.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                  active
                    ? 'bg-teal-700 border-teal-700 text-white shadow-md shadow-teal-700/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function TemperatureInput({ answer, onAnswer }) {
  const state = answer || { value: '', unit: 'C', notMeasured: false };

  const setValue = (value) => onAnswer({ value, unit: state.unit, notMeasured: false });
  const setUnit = (unit) =>
    onAnswer({ value: state.value, unit, notMeasured: state.notMeasured });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-white border-2 border-slate-200 focus-within:border-teal-400 rounded-xl px-3 py-2 transition">
          <Thermometer className="w-4 h-4 text-slate-400" />
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="120"
            placeholder="e.g. 39"
            value={state.value}
            onChange={(e) => setValue(e.target.value)}
            className="w-24 bg-transparent outline-none text-sm font-bold text-slate-800 placeholder-slate-300"
          />
        </div>
        <div className="flex rounded-xl border-2 border-slate-200 overflow-hidden">
          {['C', 'F'].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`px-3.5 py-2 text-xs font-black transition ${
                state.unit === u ? 'bg-teal-700 text-white' : 'bg-white text-slate-500 hover:text-teal-700'
              }`}
            >
              °{u}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onAnswer({ value: '', unit: state.unit, notMeasured: true })}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
            state.notMeasured
              ? 'bg-teal-700 border-teal-700 text-white'
              : 'bg-white border-slate-200 text-slate-500 hover:border-teal-400 hover:text-teal-700'
          }`}
        >
          Not measured
        </button>
      </div>
      {state.unit === 'F' && state.value !== '' && !state.notMeasured && (
        <p className="text-[10px] text-slate-400 font-semibold">
          Fahrenheit is converted to °C automatically.
        </p>
      )}
    </div>
  );
}
