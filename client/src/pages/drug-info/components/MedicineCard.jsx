import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  AlertOctagon,
  Building2,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { medicineService } from '../../../services/medicineService';
import SafetyCheckModal from './SafetyCheckModal';

export default function MedicineCard({ medicine }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [interactions, setInteractions] = useState(null);
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);

  const brand = medicine.brandName || medicine.brand;
  const generic = medicine.genericName || medicine.generic;
  const isRecalled = medicine.recallStatus === 1;

  const handleCheckInteractions = async () => {
    setCheckingInteractions(true);
    try {
      const data = await medicineService.checkInteractions(medicine.id);
      setInteractions(data || []);
    } catch (e) {
      setInteractions([]);
    } finally {
      setCheckingInteractions(false);
      setExpanded(true);
    }
  };

  return (
    <div className={`bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border ${
      isRecalled ? 'border-red-300 bg-red-50/20' : 'border-slate-100'
    } flex flex-col justify-between`}>
      <div>
        <div className="flex justify-between items-start gap-2 mb-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{brand}</h3>
            <p className="text-xs font-semibold text-teal-700 mt-0.5">{generic}</p>
          </div>
          {isRecalled ? (
            <span className="flex items-center gap-1 text-[11px] font-extrabold text-red-700 bg-red-100 border border-red-200 px-2.5 py-1 rounded-xl flex-shrink-0 animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5" /> RECALLED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> DRAP Verified
            </span>
          )}
        </div>

        {/* DRAP Reg & Category Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
            {medicine.category || 'Therapeutic'}
          </span>
          <span className="bg-slate-50 text-slate-500 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border border-slate-200">
            Reg: {medicine.drapRegNumber || 'DRAP-REG'}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-50 pt-3">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500 font-medium">Mfg:</span>
            <span className="font-semibold text-slate-800">{medicine.manufacturer || 'Approved Manufacturer'}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-500 font-medium">Usage:</span>
            <span className="text-slate-700 leading-snug">{medicine.usage_ || medicine.usage || 'Therapeutic indication under medical supervision.'}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span className="text-slate-500 font-medium">Standard Dose:</span>
            <span className="font-medium text-slate-800">{medicine.dosage || 'As directed by physician.'}</span>
          </div>
        </div>

        {/* Interaction Results Dropdown */}
        {expanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5 text-teal-600" />
              Drug Interaction Safety Report:
            </h4>
            {interactions && interactions.length > 0 ? (
              <div className="space-y-2">
                {interactions.map((int, i) => (
                  <div key={i} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                    <span className="font-bold block flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Interaction with {int.genericName1 === generic ? int.genericName2 : int.genericName1}
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-tight">{int.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px] font-medium">No severe single-drug contraindications recorded in DRAP database.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          onClick={handleCheckInteractions}
          disabled={checkingInteractions}
          className="flex-1 py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
        >
          <GitCompare className="w-3.5 h-3.5" />
          {checkingInteractions ? 'Checking...' : 'Check Interactions'}
        </button>
        <button
          onClick={() => setShowSafetyCheck(true)}
          className="flex-1 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          title="Check this medicine against a family safety profile"
        >
          <UserCheck className="w-3.5 h-3.5" />
          Check Safety
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {showSafetyCheck && (
        <SafetyCheckModal medicine={medicine} onClose={() => setShowSafetyCheck(false)} />
      )}
    </div>
  );
}
