import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, ScanLine, CheckCircle2, ArrowRight, Heart, Sparkles, Camera } from 'lucide-react';
import SafetyScoreRing from '../../components/shared/SafetyScoreRing';
import { useFamily } from '../../context/FamilyContext';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { addMember } = useFamily();
  const [step, setStep] = useState(1);
  const [memberName, setMemberName] = useState('');
  const [memberAge, setMemberAge] = useState('32');
  const [memberRelation, setMemberRelation] = useState('Self');

  const handleAddMember = async () => {
    if (memberName.trim()) {
      await addMember({ name: memberName.trim(), age: parseInt(memberAge) || 30, relation: memberRelation });
    }
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-xl bg-slate-850 border border-slate-700 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-gradient-to-r from-teal-400 to-blue-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-teal-500/20 text-teal-400 rounded-3xl flex items-center justify-center mx-auto ring-8 ring-teal-500/10">
                <Shield className="w-10 h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome to MedVigil AI</h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                Pakistan's premier AI medicine safety platform designed to protect your family from harmful drug interactions, DRAP recalls, dosage risks, and antimicrobial hazards.
              </p>
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-600 font-bold text-white shadow-lg shadow-teal-500/20 hover:opacity-95 transition flex items-center gap-2 mx-auto text-sm"
              >
                <span>Set Up Family Profiles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Add Your First Family Member</h3>
                  <p className="text-xs text-slate-400">Each member maintains their personal safety score and scan history</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="e.g. Ahmed Khan"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-teal-400 outline-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Age</label>
                    <input
                      type="number"
                      value={memberAge}
                      onChange={(e) => setMemberAge(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-teal-400 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Relation</label>
                    <select
                      value={memberRelation}
                      onChange={(e) => setMemberRelation(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-teal-400 outline-none text-sm"
                    >
                      <option value="Self">Self / Head</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Child">Child</option>
                      <option value="Grandparent">Grandparent</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button onClick={() => setStep(1)} className="text-xs text-slate-400 hover:text-white">
                  Back
                </button>
                <button
                  onClick={handleAddMember}
                  className="px-6 py-3 rounded-2xl bg-teal-500 font-bold hover:bg-teal-400 transition text-slate-950 text-sm"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-6"
            >
              <h3 className="text-xl font-bold">Understanding Your Safety Score</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Our AI continuously evaluates active medicines against DRAP registration data, recalls, and known contraindications.
              </p>

              <div className="py-2 flex justify-center">
                <SafetyScoreRing score={94} size="lg" animate={true} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
                  <span className="font-bold block">80–100</span> Safe
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <span className="font-bold block">50–79</span> Moderate
                </div>
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                  <span className="font-bold block">0–49</span> High Risk
                </div>
              </div>

              <button
                onClick={() => setStep(4)}
                className="px-8 py-3 rounded-2xl bg-teal-500 font-bold hover:bg-teal-400 transition mx-auto block text-slate-950 text-sm"
              >
                Next Step
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold">You're All Set!</h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
                Your family workspace is ready. You can now scan medicine packs, search DRAP records, and consult verified doctors anytime.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-600 font-bold text-white shadow-xl hover:opacity-95 transition text-sm"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
