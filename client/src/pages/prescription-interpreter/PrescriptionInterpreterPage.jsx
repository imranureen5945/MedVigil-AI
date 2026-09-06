import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Camera, 
  Upload, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  Bot, 
  BookOpen, 
  Calendar, 
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Pill,
  ArrowRight,
  Stethoscope,
  XCircle,
  Info,
  ShieldAlert
} from 'lucide-react';
import { prescriptionService } from '../../services/prescriptionService';
import ExtractedPrescriptionCard from './components/ExtractedPrescriptionCard';
import JargonTranslatorCard from './components/JargonTranslatorCard';
import MedicinePurposeCard from './components/MedicinePurposeCard';
import SmartScheduleCard from './components/SmartScheduleCard';
import PlainSummaryCard from './components/PlainSummaryCard';
import ClarityWarningsCard from './components/ClarityWarningsCard';

// Client-side image validation
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file selected. Please choose a prescription image.' };
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported file format. Please upload a JPEG, PNG, or WebP image.' };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image is too large. Maximum allowed size is 10MB.' };
  }
  if (file.size < 1024) {
    return { valid: false, error: 'Image appears to be blank or corrupted. Please upload a valid prescription image.' };
  }
  return { valid: true };
}

export default function PrescriptionInterpreterPage() {
  const [image, setImage] = useState(null);
  const [interpreting, setInterpreting] = useState(false);
  const [stepText, setStepText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Async protection: latest request ID wins
  const currentRequestId = useRef(null);

  // Realistic Pakistani doctor handwritten prescription samples
  const prescriptionSamples = [
    {
      title: 'Augmentin 625mg (Handwritten Rx)',
      subtitle: 'Tab Augmentin 625mg • 1 tab BD PC × 5 days',
      rawOcr: 'Rx: Tab Augmentin 625mg 1 tab BD PC x 5 days (Take after meals with water)'
    },
    {
      title: 'Risek 20mg (Gastric Rx)',
      subtitle: 'Cap Risek 20mg • 1 cap OD AC × 14 days',
      rawOcr: 'Rx: Cap Risek 20mg 1 cap OD AC x 14 days (Nihar munh 30 mins before breakfast)'
    },
    {
      title: 'Panadol Extra 500mg (SOS Rx)',
      subtitle: 'Tab Panadol 500mg • 1 tab TDS SOS',
      rawOcr: 'Rx: Tab Panadol 500mg 1 tab TDS SOS (Sirf zaroorat ya bukhaar ke waqt)'
    },
    {
      title: 'Calpol 120mg/5ml (Pediatric Rx)',
      subtitle: 'Syp Calpol • 1 tsp TDS × 3 days',
      rawOcr: 'Rx: Syp Calpol 120mg/5ml 1 tsp (5ml) TDS x 3 days for fever'
    }
  ];

  const processPrescription = async (imageData, textData) => {
    // State isolation: clear all previous results
    setResult(null);
    setError(null);
    setInterpreting(true);
    setStepText('Validating prescription image...');

    // Generate unique request ID for async protection
    const reqId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    currentRequestId.current = reqId;

    try {
      await new Promise(r => setTimeout(r, 400));
      setStepText('AI deciphering handwritten prescription...');
      
      await new Promise(r => setTimeout(r, 400));
      setStepText('Translating medical abbreviations (OD, BD, TDS, AC, PC)...');
      
      const response = await prescriptionService.interpretPrescription({
        image: imageData,
        ocrText: textData
      });

      // Async protection: ignore stale responses
      if (currentRequestId.current !== reqId) return;

      // Check if backend returned an error (e.g., image validation failure)
      if (response.success === false && response.error) {
        setError(response.error);
        setInterpreting(false);
        setStepText('');
        return;
      }

      await new Promise(r => setTimeout(r, 300));
      if (currentRequestId.current !== reqId) return;
      setStepText('Generating smart medication timetable & Roman Urdu summaries...');
      await new Promise(r => setTimeout(r, 300));
      if (currentRequestId.current !== reqId) return;

      setResult(response);
    } catch (err) {
      if (currentRequestId.current !== reqId) return;
      console.error('Prescription interpretation error:', err);
      const message = err.response?.data?.message || err.response?.data?.error || 
        'Unable to process the prescription. Please check your internet connection and try again.';
      setError(message);
    } finally {
      if (currentRequestId.current === reqId) {
        setInterpreting(false);
        setStepText('');
      }
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Client-side image validation
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error);
        setResult(null);
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        setImage(base64);
        processPrescription(base64, null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleClick = (sample) => {
    setError(null);
    const mockRxImage = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=60';
    setImage(mockRxImage);
    processPrescription(null, sample.rawOcr);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setImage(null);
    currentRequestId.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Check if result is an unknown/rejected medicine
  const isUnknown = result && (
    result.verificationStatus === 'REJECTED' ||
    result.extractedPrescription?.medicineName === 'UNKNOWN' ||
    result.extractedPrescription?.brandName === 'UNKNOWN'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-med-dark via-slate-900 to-med-navy p-6 sm:p-8 text-white shadow-xl border border-white/15">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sea-green/15 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sea-green/20 text-sea-light border border-sea-green/40">
            <Stethoscope className="w-4 h-4" />
            <span>Prescription Interpreter AI</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Scan. Decode. Understand.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Photograph or upload any handwritten doctor slip, printed prescription, or medicine instruction sheet. Our AI translates Latin medical abbreviations into simple, daily timetables in English & Roman Urdu.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-red-50 border-2 border-red-200 flex items-start gap-3.5 shadow-sm"
        >
          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm text-red-900">
            <h4 className="font-black text-red-800">Processing Error</h4>
            <p className="text-red-700 text-xs leading-relaxed">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold text-red-600 hover:text-red-800 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {!result ? (
        <div className="space-y-6">
          {/* Main Upload / Camera Capture Dropzone */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-subtle border border-white/80 relative">
            <label className="border-3 border-dashed border-teal-300 bg-teal-50/40 rounded-3xl h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50/80 transition-all relative overflow-hidden group">
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              
              {image ? (
                <>
                  <img src={image} alt="Prescription Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  {interpreting && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center z-30">
                      <div className="w-16 h-16 border-4 border-sea-light border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="font-black text-lg text-white">{stepText || 'Interpreting prescription...'}</p>
                      <p className="text-xs text-teal-200 mt-1">Translating dosage abbreviations & generating schedule</p>
                      
                      {/* Laser beam scan effect */}
                      <motion.div 
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                        className="absolute left-4 right-4 h-1 bg-sea-light shadow-[0_0_15px_4px_rgba(45,212,191,0.9)] z-20"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-md flex items-center justify-center mx-auto text-sea-green group-hover:scale-110 transition duration-300 border border-teal-100">
                    <Camera className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="font-black text-base sm:text-lg text-slate-800">
                      Scan or Upload Doctor Prescription
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Works with handwritten doctor slips, hospital discharge papers & packaging leaflets
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Accepted: JPEG, PNG, WebP (max 10MB)
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sea-green to-teal-700 text-white text-xs font-black shadow-md shadow-sea-green/20">
                    <Upload className="w-3.5 h-3.5" /> Choose Prescription File
                  </span>
                </div>
              )}
            </label>
          </div>

          {/* Interactive Pakistani Prescription Demo Samples */}
          <div className="bg-gradient-to-r from-med-dark via-slate-900 to-med-navy rounded-3xl p-6 text-white border border-white/15 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-sea-light" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Interactive Pakistani Prescription Samples
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Tap any sample below to simulate instant doctor handwriting recognition, abbreviation decoding, and schedule generation:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {prescriptionSamples.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => handleSampleClick(sample)}
                  disabled={interpreting}
                  className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-sea-light/50 rounded-2xl text-left transition duration-150 flex flex-col justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div>
                    <span className="font-black text-xs text-sea-light block group-hover:text-white transition-colors">
                      {sample.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono block mt-1">
                      {sample.subtitle}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-400 mt-2 block">
                    Tap to Decode Rx →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : isUnknown ? (
        /* UNKNOWN / REJECTED Medicine Result */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Medicine Could Not Be Confirmed */}
          <div className="p-6 sm:p-8 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-subtle space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-xl text-amber-900">Medicine Could Not Be Confirmed</h3>
                <p className="text-xs text-amber-700 font-medium">
                  The system could not confidently identify the medicine from the provided image or text.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(result.completenessWarnings || []).map((warning, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white border border-amber-200 text-xs font-bold text-amber-950 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-sea-green to-teal-600 hover:from-teal-600 hover:to-sea-green text-white font-black text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Upload Clearer Image
              </button>
              <button
                onClick={() => window.location.href = '/drug-info'}
                className="px-5 py-3.5 rounded-2xl bg-white border-2 border-slate-200 hover:border-sea-green text-slate-800 font-black text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2"
              >
                <Pill className="w-4 h-4" />
                Enter Medicine Manually
              </button>
            </div>

            {result.rawText && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                <strong className="text-slate-800 block mb-1">Raw OCR Evidence:</strong>
                <span className="font-mono text-[11px]">{result.rawText}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-subtle border border-white/80">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try Another Prescription
            </button>
          </div>
        </motion.div>
      ) : (
        /* Successful Results Section */
        <div className="space-y-5">
          {/* Top Reset Bar */}
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-subtle border border-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-sea-green" />
              <span className="font-black text-xs sm:text-sm text-slate-900">
                Prescription Successfully Decoded
              </span>
              {result.verificationStatus && (
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${
                  result.verificationStatus === 'VERIFIED' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : result.verificationStatus === 'UNCERTAIN'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {result.verificationStatus}
                </span>
              )}
            </div>

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Decode Another Prescription</span>
            </button>
          </div>

          {/* Uncertain Warning Banner */}
          {result.verificationStatus === 'UNCERTAIN' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <strong>Low Confidence:</strong> The medicine was partially identified but could not be fully verified against the DRAP database. Please confirm with your pharmacist before use.
              </div>
            </div>
          )}

          {/* 1. Extracted Prescription */}
          <ExtractedPrescriptionCard prescription={result.extractedPrescription} />

          {/* 2. Jargon Translation */}
          {result.jargonTranslations?.length > 0 && (
            <JargonTranslatorCard translations={result.jargonTranslations} />
          )}

          {/* 3. Medicine Purpose */}
          <MedicinePurposeCard 
            purpose={result.medicinePurpose} 
            medicineName={result.extractedPrescription?.medicineName} 
          />

          {/* 4. Smart Medication Schedule */}
          {result.medicationSchedule?.slots?.length > 0 && (
            <SmartScheduleCard schedule={result.medicationSchedule} />
          )}

          {/* 5. Plain Language Summary (with English / Roman Urdu Toggle) */}
          <PlainSummaryCard summary={result.plainLanguageSummary} />

          {/* 6. Warnings & Clarifications */}
          <ClarityWarningsCard 
            warnings={result.completenessWarnings} 
            clarityScore={result.clarityScore}
            confidenceLevel={result.confidenceLevel}
          />

          {/* Raw OCR Evidence (collapsible) */}
          {result.rawText && (
            <details className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <summary className="text-xs font-bold text-slate-600 cursor-pointer flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />
                Raw OCR Evidence
              </summary>
              <p className="mt-2 text-[11px] font-mono text-slate-500 bg-white p-3 rounded-xl border border-slate-100">
                {result.rawText}
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
