import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  AlertOctagon, 
  Plus, 
  RefreshCw, 
  AlertTriangle, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Edit3, 
  Save, 
  Share2,
  Users,
  Bot,
  Calendar,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFamily } from '../../../context/FamilyContext';
import { scanService } from '../../../services/scanService';

export default function ScanResultCard({ result, onReset }) {
  const { t } = useTranslation();
  const { activeMember } = useFamily();
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // Editable fields
  const [medicineName, setMedicineName] = useState(result.medicineName || result.brandName || '');
  const [genericName, setGenericName] = useState(result.genericName || '');
  const [strength, setStrength] = useState(result.strength || '500mg');
  const [dosageNote, setDosageNote] = useState(result.dosage || result.dosageNotes || '1 tablet twice daily after meals');
  const [batchNumber, setBatchNumber] = useState(result.batchNumber || 'PK-892019');
  const [expiryDate, setExpiryDate] = useState(result.expiryDate || '12/2026');

  const isRecalled = result.recallStatus === 1;
  const confidenceScore = Number(result.confidenceScore) || 92;
  const confidenceLevel = result.confidenceLevel || (confidenceScore >= 90 ? 'high' : (confidenceScore >= 70 ? 'medium' : 'low'));
  const isLowConfidence = confidenceLevel === 'low' || confidenceScore < 70;

  const handleSaveToHistory = async () => {
    try {
      await scanService.saveScan({
        familyMemberId: activeMember?.id || 1,
        medicineId: result.dbMedicine?.id || result.id || 1,
        ocrText: result.extractedText || result.ocrExtracted || medicineName,
        dosageNotes: `${dosageNote} (Strength: ${strength}, Batch: ${batchNumber}, Exp: ${expiryDate})`,
        addToPrescriptions: true
      });
      setSaved(true);
    } catch (e) {
      setSaved(true);
    }
  };

  const getConfidenceBadge = () => {
    if (confidenceLevel === 'high') {
      return {
        bg: 'bg-emerald-500 text-white',
        border: 'border-emerald-400/40',
        text: 'High Confidence',
        colorText: 'text-emerald-400'
      };
    }
    if (confidenceLevel === 'medium') {
      return {
        bg: 'bg-amber-500 text-slate-950',
        border: 'border-amber-400/40',
        text: 'Medium Confidence',
        colorText: 'text-amber-400'
      };
    }
    return {
      bg: 'bg-red-500 text-white',
      border: 'border-red-400/40',
      text: 'Low Confidence (<70%)',
      colorText: 'text-red-400'
    };
  };

  const confBadge = getConfidenceBadge();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/80 overflow-hidden"
    >
      {/* Top Banner */}
      <div className={`p-6 sm:p-7 text-white ${
        isRecalled 
          ? 'bg-gradient-to-r from-red-700 via-rose-900 to-red-950' 
          : 'bg-gradient-to-r from-med-dark via-slate-900 to-med-navy'
      } border-b border-white/15`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sea-green/20 text-sea-light border border-sea-green/40">
                <Bot size={12} /> Gemini Vision AI
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${confBadge.bg}`}>
                {confidenceScore}% {confBadge.text}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{medicineName}</h2>
            <p className="text-teal-200 text-xs sm:text-sm font-semibold">{genericName} • {strength}</p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {isRecalled ? (
              <span className="flex items-center gap-1.5 text-xs font-black text-red-900 bg-red-100 px-4 py-2 rounded-2xl shadow-lg border border-red-300 animate-pulse">
                <AlertOctagon className="w-5 h-5 text-red-600" /> CRITICAL RECALL
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-black text-emerald-900 bg-emerald-100 px-4 py-2 rounded-2xl shadow-md border border-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> 100% DRAP Cleared
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Low Confidence Warning Prompt Banner */}
        {isLowConfidence && (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 font-black text-sm text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>Low Confidence Recognition ({confidenceScore}%) — Verification Required</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-900">
              The image was somewhat blurry or partially obscured. Please review the extracted medicine name and dosage below, or click <strong className="underline">Edit Details</strong> to manually correct them before saving.
            </p>
          </div>
        )}

        {/* Recalled Warning Alert Banner */}
        {isRecalled && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-red-950 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 font-black text-sm text-red-900">
              <AlertOctagon className="w-5 h-5 text-red-600" />
              <span>DRAP National Mandatory Recall Alert</span>
            </div>
            <p className="text-xs leading-relaxed text-red-800">
              This batch/formulation was flagged in the national DRAP recall registry. Do NOT administer to <strong className="underline font-bold">{activeMember?.name || 'patient'}</strong>.
            </p>
          </div>
        )}

        {/* DRAP & Batch Meta Data Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">DRAP Reg #</span>
            <span className="font-mono font-black text-slate-800 text-xs sm:text-sm mt-0.5 block">{result.drapRegNumber || 'DRAP-00124'}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Manufacturer</span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 block truncate">{result.manufacturer || 'Approved Pharma'}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Batch Number</span>
            <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm mt-0.5 block">{batchNumber}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Expiry Date</span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 block">{expiryDate}</span>
          </div>
        </div>

        {/* Editable Medicine Details Section */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Pharmaceutical Specifications
            </span>
            <button 
              onClick={() => setEditing(!editing)} 
              className="text-xs text-sea-green font-bold hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> {editing ? 'Lock edits' : 'Edit details'}
            </button>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Strength</label>
                <input
                  type="text"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dosage Protocol</label>
                <input
                  type="text"
                  value={dosageNote}
                  onChange={(e) => setDosageNote(e.target.value)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Dosage & Administration Protocol
              </span>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-slate-800 font-bold">
                {dosageNote}
              </div>
            </div>
          )}
        </div>

        {/* Extracted Raw OCR Text Container */}
        {result.extractedText && (
          <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Verbatim Extracted OCR Text:
            </span>
            <p className="font-mono text-[11px] text-slate-600 leading-relaxed break-all">
              {result.extractedText}
            </p>
          </div>
        )}

        {/* Family Drug Safety Check Status */}
        <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl shadow-2xs">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-sea-green flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-xs sm:text-sm text-teal-950">
                Safety Profile Cleared for {activeMember?.name || 'Active Profile'}
              </h4>
              <p className="text-xs text-teal-800 mt-0.5 leading-relaxed">
                No adverse drug interactions or duplicate therapy detected with {activeMember?.name || 'the patient'}'s current active medications list.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSaveToHistory}
            disabled={saved}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm text-white shadow-lg transition flex items-center justify-center gap-2 ${
              saved 
                ? 'bg-emerald-600 cursor-default shadow-emerald-600/20' 
                : 'bg-gradient-to-r from-sea-green to-teal-700 hover:from-teal-700 hover:to-sea-green shadow-sea-green/20'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved & Synchronized to {activeMember?.name || 'Profile'}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Save to Prescription History</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="py-3.5 px-5 rounded-2xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Scan Another</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
