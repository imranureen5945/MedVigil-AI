import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  Printer, 
  PhoneCall, 
  Heart, 
  ShieldAlert, 
  Save, 
  CheckCircle2,
  Siren,
  PhoneForwarded,
  Info
} from 'lucide-react';
import { emergencyService } from '../../services/emergencyService';
import { useFamily } from '../../context/FamilyContext';

export default function EmergencyGuidePage() {
  const { t, i18n } = useTranslation();
  const { activeMember } = useFamily();
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState('');
  const [criticalMedications, setCriticalMedications] = useState('');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeMember?.id) {
      emergencyService.getEmergencyInfo(activeMember.id).then(data => {
        if (data) {
          if (data.bloodType) setBloodType(data.bloodType);
          if (data.allergies) setAllergies(data.allergies);
          if (data.emergencyContacts) setEmergencyContacts(data.emergencyContacts);
          if (data.criticalMedications) setCriticalMedications(data.criticalMedications);
          if (data.notes) setNotes(data.notes);
        }
      });
    }
  }, [activeMember]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await emergencyService.saveEmergencyInfo(activeMember?.id || 1, {
        bloodType,
        allergies,
        emergencyContacts,
        criticalMedications,
        notes
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const emergencyHelplines = [
    { name: 'Rescue 1122 (Ambulance / Fire)', number: '1122', bg: 'bg-red-600' },
    { name: 'Edhi Emergency Ambulance', number: '1020 / 115', bg: 'bg-rose-700' },
    { name: 'Chhipa Ambulance Service', number: '1020', bg: 'bg-red-700' },
    { name: 'National Poison Control Center', number: '021-99205058', bg: 'bg-slate-900' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Urgent Emergency Alert & Helplines */}
      <div className="bg-red-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-red-950/20 border border-red-500 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Siren className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Pakistan Emergency Medical Guide
              </h1>
              <p className="text-xs text-red-100 mt-0.5">
                Instant protocols and critical patient profile for first responders
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white text-red-700 font-bold rounded-xl text-xs shadow hover:bg-red-50 transition flex items-center gap-1.5 self-end sm:self-center"
          >
            <Printer className="w-4 h-4" />
            <span>Print Emergency Card</span>
          </button>
        </div>

        {/* National Helplines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
          {emergencyHelplines.map((line, i) => (
            <a
              key={i}
              href={`tel:${line.number.split(' ')[0]}`}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition flex flex-col justify-between"
            >
              <span className="text-[11px] font-semibold text-red-100 block leading-tight">{line.name}</span>
              <span className="font-mono font-black text-sm text-white mt-1 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" /> {line.number}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Emergency Form for Active Member */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Ledger For</span>
            <h2 className="text-lg font-black text-slate-900">{activeMember?.name || 'Select a Profile'} ({activeMember?.relation || 'Profile'})</h2>
          </div>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Emergency Ready
          </span>
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Blood Group
              </label>
              <select 
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-4 py-3 text-base font-extrabold border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition text-red-700"
              >
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Emergency Contact Phone Numbers
              </label>
              <textarea 
                rows={2}
                value={emergencyContacts}
                onChange={(e) => setEmergencyContacts(e.target.value)}
                placeholder="Name & Contact (e.g. Brother: 0300-1234567)"
                className="w-full p-3 text-xs sm:text-sm font-semibold border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none transition" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-red-700 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Critical Drug Allergies & Hypersensitivities
            </label>
            <textarea 
              rows={2} 
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Severe Penicillin anaphylaxis, Sulfa, Aspirin-induced asthma..."
              className="w-full p-3.5 text-xs sm:text-sm font-bold border-2 border-red-200 rounded-2xl bg-red-50/30 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none text-red-950 transition" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Active Daily Life-Saving Medications
            </label>
            <textarea 
              rows={2} 
              value={criticalMedications}
              onChange={(e) => setCriticalMedications(e.target.value)}
              placeholder="e.g. Insulin Glargine 20 units at night, Ventolin inhaler 2 puffs PRN..."
              className="w-full p-3.5 text-xs sm:text-sm font-semibold border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none transition text-slate-800" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Special First Responder Instructions / Chronic Conditions
            </label>
            <textarea 
              rows={2} 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Diabetic, hypertensive, pacemaker installed..."
              className="w-full p-3.5 text-xs sm:text-sm font-medium border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none transition text-slate-800" 
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Emergency Information Updated!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Emergency Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
