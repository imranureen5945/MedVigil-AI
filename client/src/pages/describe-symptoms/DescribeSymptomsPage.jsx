import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertTriangle,
  Check,
  MessageCircle,
  Sparkles,
  Stethoscope,
  UserPlus,
  XCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { familySafetyService } from '../../services/familySafetyService';
import { triageService } from '../../services/triageService';
import SymptomsStep from './components/SymptomsStep';
import QuestionsStep from './components/QuestionsStep';
import MedicineStep from './components/MedicineStep';
import ProcessingStep from './components/ProcessingStep';
import ResultStep from './components/ResultStep';
import HistoryPanel from './components/HistoryPanel';

// The visible flow: 1. Symptoms → 2. Questions → 3. Safety Check → 4. Result.
// "processing" belongs to the Result step — it is the real server work.
const FLOW_STEPS = [
  { id: 'symptoms', label: 'Symptoms' },
  { id: 'questions', label: 'Questions' },
  { id: 'medicine', label: 'Safety Check' },
  { id: 'result', label: 'Result' }
];

const getApiErrorMessage = (e, fallback) =>
  e?.response?.data?.message || e?.message || fallback;

export default function DescribeSymptomsPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  // Flow state
  const [step, setStep] = useState('symptoms');
  const [vaultProfiles, setVaultProfiles] = useState([]);
  const [profilesLoaded, setProfilesLoaded] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [starting, setStarting] = useState(false);

  // Adaptive questions
  const [startData, setStartData] = useState(null);
  const [answers, setAnswers] = useState({});

  // Planned medicine
  const [plan, setPlan] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [medCheck, setMedCheck] = useState(null);
  const [medChecking, setMedChecking] = useState(false);
  const [medError, setMedError] = useState(null);

  // Result + history
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [error, setError] = useState(null);

  const language = i18n.language?.startsWith('ur') ? 'ur' : 'en';
  const selectedProfile = vaultProfiles.find((p) => String(p.id) === String(selectedProfileId));

  useEffect(() => {
    let cancelled = false;
    familySafetyService.getProfiles()
      .then((profiles) => {
        if (cancelled) return;
        setVaultProfiles(profiles);
        if (profiles.length === 1) setSelectedProfileId(String(profiles[0].id));
      })
      .catch(() => { if (!cancelled) setVaultProfiles([]); })
      .finally(() => { if (!cancelled) setProfilesLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const loadHistory = () => {
    setHistoryLoading(true);
    triageService.getHistory()
      .then((entries) => setHistory(entries))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  };

  useEffect(() => { loadHistory(); }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // ---- Step 1 → 2: start the assessment -------------------------------
  const handleStart = async () => {
    if (!selectedProfileId) {
      setError('Please select who this assessment is for.');
      return;
    }
    if (!symptoms.trim()) {
      setError('Please describe the symptoms first — a few words are enough.');
      return;
    }
    setStarting(true);
    setError(null);
    try {
      const data = await triageService.startAssessment({
        familyMemberId: selectedProfileId,
        symptoms: symptoms.trim(),
        language
      });
      setStartData(data);
      setAnswers({});
      setStep('questions');
      scrollTop();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to start the assessment. Please check your connection and try again.'));
    } finally {
      setStarting(false);
    }
  };

  const handleAnswer = (questionId, value) =>
    setAnswers((prev) => ({ ...prev, [questionId]: value }));

  // ---- Step 2 → 3 ------------------------------------------------------
  const handleQuestionsContinue = () => {
    setStep('medicine');
    scrollTop();
  };

  // ---- Medicine picker: live check of the planned medicine -------------
  const runMedicationCheck = async (med) => {
    setSelectedMed(med);
    setMedCheck(null);
    setMedError(null);
    setMedChecking(true);
    try {
      const data = await triageService.medicationCheck({
        familyMemberId: selectedProfileId,
        medicineId: med.id || null,
        medicineName: med.id ? null : med.name
      });
      setMedCheck(data);
    } catch (e) {
      setMedError(getApiErrorMessage(e, 'The medicine check could not be completed.'));
    } finally {
      setMedChecking(false);
    }
  };

  // ---- Step 3 → 4: run the full assessment -----------------------------
  const buildCleanAnswers = () => {
    const clean = {};
    (startData?.questions || []).forEach((q) => {
      const a = answers[q.id];
      if (q.type === 'temperature') {
        // "Not measured" is a valid answer — it is simply omitted so the
        // server treats the temperature as unknown.
        if (a && !a.notMeasured && a.value !== '' && a.value != null) {
          clean[q.id] = { value: Number(a.value), unit: a.unit || 'C' };
        }
      } else if (a !== undefined && a !== null && a !== '') {
        clean[q.id] = a;
      }
    });
    return clean;
  };

  const processingMessages = [
    'Understanding your symptoms...',
    'Checking warning signs...',
    'Reviewing your saved safety information...',
    ...(plan === 'yes' ? ['Checking the medicine you selected...'] : []),
    'Preparing your safety assessment...'
  ];

  const handleMedicineContinue = async () => {
    const plannedMedicine = plan === 'yes'
      ? {
          plan: 'yes',
          ...(selectedMed?.id ? { medicineId: selectedMed.id } : { medicineName: selectedMed.name })
        }
      : { plan: plan || 'no' };

    setStep('processing');
    setError(null);
    try {
      const data = await triageService.assess({
        familyMemberId: selectedProfileId,
        symptoms: startData.symptoms,
        answers: buildCleanAnswers(),
        plannedMedicine,
        language
      });
      setResult(data);
      setStep('result');
      loadHistory();
      scrollTop();
    } catch (e) {
      setError(getApiErrorMessage(e, 'The assessment could not be completed. Please try again.'));
      setStep('medicine');
      scrollTop();
    }
  };

  const handleDeleteHistory = async (id) => {
    if (!window.confirm('Delete this assessment from the history?')) return;
    try {
      await triageService.deleteHistory(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (e) {
      setError(getApiErrorMessage(e, 'The assessment could not be deleted.'));
    }
  };

  const handleConsultDoctor = () => {
    navigate('/doctor-connect', {
      state: {
        prefillSymptom:
          result?.normalizedSymptoms?.map((s) => s.label).join(', ')
          || symptoms
          || 'General consultation',
        urgency: result?.riskLevel === 'RED' ? 'emergency' : 'concerning'
      }
    });
  };

  const handleRestart = () => {
    setStep('symptoms');
    setSymptoms('');
    setStartData(null);
    setAnswers({});
    setPlan('');
    setSelectedMed(null);
    setMedCheck(null);
    setMedError(null);
    setResult(null);
    setError(null);
    scrollTop();
  };

  // ----------------------------------------------------------------------

  const activeFlowIndex = FLOW_STEPS.findIndex((s) => s.id === (step === 'processing' ? 'result' : step));

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-12">

      {/* Header banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-med-dark via-slate-900 to-med-navy p-6 sm:p-8 text-white shadow-xl shadow-med-navy/20 border border-white/15">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sea-green/20 to-transparent pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-sea-light/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 p-2 border border-sea-green/40 shadow-glow-teal flex-shrink-0 flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-sea-light" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sea-green/20 text-sea-light border border-sea-green/40 mb-1">
                <Sparkles size={11} />
                <span>Check Before You Self-Medicate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Self-Medication Risk Assessment
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Symptoms, warning signs and your planned medicine — checked against your Family Safety Vault
              </p>
            </div>
          </div>

          <button
            onClick={handleConsultDoctor}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sea-green to-teal-600 hover:from-teal-600 hover:to-sea-green text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-2 flex-shrink-0 self-stretch sm:self-auto justify-center"
          >
            <MessageCircle size={15} />
            <span>Consult Verified Doctor</span>
          </button>
        </div>
      </div>

      {/* Regulatory notice */}
      <div className="bg-amber-500/10 border-2 border-amber-400/40 p-4 sm:p-5 rounded-3xl flex items-start gap-3.5 shadow-sm text-amber-900 backdrop-blur-md">
        <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm leading-relaxed text-amber-950">
          <h4 className="font-black text-amber-900 text-sm">Safety guidance — not a diagnosis</h4>
          <p>
            This assessment checks whether self-medicating is <strong>safe</strong> for the selected person.
            It <strong>never diagnoses, prescribes or recommends medicines</strong>. In an emergency, call
            1122 immediately.
          </p>
        </div>
      </div>

      {/* No vault profile yet — the flow requires one */}
      {profilesLoaded && vaultProfiles.length === 0 && (
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 border border-teal-200 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-teal-700" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Create a family profile first</h3>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            Every safety check runs against a Family Safety Vault profile — the saved allergies, current
            medicines and health conditions are what make the assessment accurate.
          </p>
          <Link
            to="/family-profile"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sea-green to-teal-600 text-white font-black text-xs shadow-lg shadow-sea-green/30 hover:from-teal-600 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Open Family Profile</span>
          </Link>
        </div>
      )}

      {/* Flow */}
      {profilesLoaded && vaultProfiles.length > 0 && (
        <>
          {/* Step indicator */}
          {step !== 'processing' && (
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm">
              <div className="flex items-center justify-between gap-1 sm:gap-2">
                {FLOW_STEPS.map((flowStep, i) => {
                  const done = i < activeFlowIndex;
                  const active = i === activeFlowIndex;
                  return (
                    <div key={flowStep.id} className="flex items-center gap-1 sm:gap-2 flex-1 last:flex-none">
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black transition ${
                            done
                              ? 'bg-teal-700 text-white'
                              : active
                                ? 'bg-gradient-to-r from-sea-green to-teal-600 text-white shadow-md shadow-sea-green/30'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}
                        >
                          {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </span>
                        <span
                          className={`hidden md:block text-[11px] font-black uppercase tracking-wide ${
                            active ? 'text-teal-800' : done ? 'text-slate-600' : 'text-slate-400'
                          }`}
                        >
                          {flowStep.label}
                        </span>
                      </div>
                      {i < FLOW_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 rounded-full ${done ? 'bg-teal-600' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Page-level error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-5 rounded-3xl bg-red-50 border-2 border-red-200 flex items-start gap-3.5"
              >
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm text-red-900 flex-1">
                  <h4 className="font-black text-red-800">Something went wrong</h4>
                  <p className="text-red-700 text-xs leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-xs font-bold text-red-600 hover:text-red-800 underline shrink-0"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {step === 'symptoms' && (
                <SymptomsStep
                  vaultProfiles={vaultProfiles}
                  selectedProfileId={selectedProfileId}
                  onSelectProfile={setSelectedProfileId}
                  symptoms={symptoms}
                  onSymptomsChange={setSymptoms}
                  loading={starting}
                  onStart={handleStart}
                />
              )}

              {step === 'questions' && startData && (
                <QuestionsStep
                  startData={startData}
                  answers={answers}
                  onAnswer={handleAnswer}
                  onBack={() => { setStep('symptoms'); scrollTop(); }}
                  onContinue={handleQuestionsContinue}
                />
              )}

              {step === 'medicine' && startData && (
                <MedicineStep
                  profile={selectedProfile}
                  plan={plan}
                  onPlanChange={setPlan}
                  selectedMed={selectedMed}
                  medCheck={medCheck}
                  medChecking={medChecking}
                  medError={medError}
                  onPickMedicine={runMedicationCheck}
                  onManualCheck={runMedicationCheck}
                  onBack={() => { setStep('questions'); scrollTop(); }}
                  onContinue={handleMedicineContinue}
                />
              )}

              {step === 'processing' && <ProcessingStep messages={processingMessages} />}

              {step === 'result' && result && (
                <ResultStep
                  result={result}
                  onRestart={handleRestart}
                  onConsultDoctor={handleConsultDoctor}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* History */}
          {(step === 'symptoms' || step === 'result') && (
            <HistoryPanel
              history={history}
              loading={historyLoading}
              onDelete={handleDeleteHistory}
            />
          )}
        </>
      )}
    </div>
  );
}
