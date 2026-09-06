const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, 'client', 'src');

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeFile(relativePath, content) {
  const fullPath = path.join(srcDir, relativePath);
  ensureDir(fullPath);
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Created:', relativePath);
}

// 1. LoginPage.jsx
writeFile('pages/auth/LoginPage.jsx', `
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Activity, User, Stethoscope, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, doctorLogin } = useAuth();
  
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('demo@medvigil.pk');
  const [password, setPassword] = useState('patient123');
  const [doctorId, setDoctorId] = useState('DR-FM-001');
  const [doctorPass, setDoctorPass] = useState('doctor123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (role === 'patient') {
        const res = await login(email, password);
        if (res.user && res.user.isFirstLogin) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        await doctorLogin(doctorId, doctorPass);
        navigate('/doctor-portal');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-blue-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md backdrop-blur-2xl bg-white/95 border border-white/30 rounded-3xl shadow-2xl p-8"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20 mb-3 overflow-hidden p-2">
            <img src="/logo.jpg" alt="MedVigil Logo" className="w-full h-full object-contain rounded-xl" onError={(e)=>{e.target.style.display='none'}} />
            <Shield className="w-8 h-8 text-white hidden" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">MedVigil AI</h1>
          <p className="text-xs text-teal-700 font-semibold uppercase tracking-widest mt-1">
            Pakistan's Family Medicine Safety Platform
          </p>
        </div>

        {/* Role Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setRole('patient'); setError(''); }}
            className={\`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all \${
              role === 'patient' ? 'bg-white shadow-sm text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }\`}
          >
            <User className="w-4 h-4" />
            Patient / Family
          </button>
          <button
            type="button"
            onClick={() => { setRole('doctor'); setError(''); }}
            className={\`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all \${
              role === 'doctor' ? 'bg-white shadow-sm text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }\`}
          >
            <Stethoscope className="w-4 h-4" />
            Doctor Portal
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === 'patient' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm transition"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Doctor ID / Registration No.
                </label>
                <input
                  type="text"
                  required
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  placeholder="e.g. DR-FM-001"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">Available: DR-FM-001 (Dr. Faisal) or DR-AT-002 (Dr. Aneeqa)</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Doctor Password
                </label>
                <input
                  type="password"
                  required
                  value={doctorPass}
                  onChange={(e) => setDoctorPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={\`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition duration-200 flex items-center justify-center gap-2 \${
              role === 'patient'
                ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-teal-600/30'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-600/30'
            } \${loading ? 'opacity-70 cursor-wait' : ''}\`}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to {role === 'patient' ? 'Family Health' : 'Clinical Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {role === 'patient' && (
          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have a family account?{' '}
            <Link to="/signup" className="text-teal-700 font-bold hover:underline">
              Create one here
            </Link>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5 text-teal-600" />
          <span>DRAP Verified & 256-bit Encrypted Health Data</span>
        </div>
      </motion.div>
    </div>
  );
}
`);

// 2. SignupPage.jsx
writeFile('pages/auth/SignupPage.jsx', `
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, UserPlus, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup({ name, email, password, language });
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-blue-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md backdrop-blur-2xl bg-white/95 border border-white/30 rounded-3xl shadow-2xl p-8"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20 mb-3 overflow-hidden p-2">
            <img src="/logo.jpg" alt="MedVigil Logo" className="w-full h-full object-contain rounded-xl" onError={(e)=>{e.target.style.display='none'}} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Create Family Profile</h1>
          <p className="text-xs text-teal-700 font-semibold uppercase tracking-widest mt-1">
            Start protecting your family from drug harms
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Guardian / Family Head Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tariq Mehmood"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Create Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Preferred Language / ترجیحی زبان
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none text-sm transition"
            >
              <option value="en">English (Default)</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : (
              <>
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-teal-700 font-bold hover:underline">
            Sign in here
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Lock className="w-3.5 h-3.5 text-teal-600" />
          <span>Your family health records are strictly private and encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
`);

// 3. OnboardingPage.jsx
writeFile('pages/onboarding/OnboardingPage.jsx', `
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, ScanLine, CheckCircle2, ArrowRight, Heart, Sparkles } from 'lucide-react';
import SafetyScoreRing from '../../components/shared/SafetyScoreRing';
import { useFamily } from '../../context/FamilyContext';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { addMember } = useFamily();
  const [step, setStep] = useState(1);
  const [memberName, setMemberName] = useState('');
  const [memberAge, setMemberAge] = useState('35');
  const [memberRelation, setMemberRelation] = useState('Self');

  const handleAddMember = async () => {
    if (memberName.trim()) {
      await addMember({ name: memberName, age: parseInt(memberAge) || 30, relation: memberRelation });
    }
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-xl bg-slate-800/90 border border-slate-700 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={\`h-1.5 flex-1 rounded-full transition-all duration-300 \${
                s <= step ? 'bg-gradient-to-r from-teal-400 to-blue-500' : 'bg-slate-700'
              }\`}
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
              <h2 className="text-3xl font-extrabold tracking-tight">Welcome to MedVigil AI</h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
                Pakistan’s premier AI safety companion designed to protect your family from harmful drug interactions, DRAP recalls, dosage risks, and antimicrobial hazards.
              </p>
              <button
                onClick={() => setStep(2)}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 font-bold text-white shadow-lg shadow-teal-500/20 hover:opacity-95 transition flex items-center gap-2 mx-auto"
              >
                <span>Setup Family Profiles</span>
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
                <Users className="w-8 h-8 text-teal-400" />
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
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600 text-white focus:ring-2 focus:ring-teal-400 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Age</label>
                    <input
                      type="number"
                      value={memberAge}
                      onChange={(e) => setMemberAge(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600 text-white focus:ring-2 focus:ring-teal-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Relation</label>
                    <select
                      value={memberRelation}
                      onChange={(e) => setMemberRelation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600 text-white focus:ring-2 focus:ring-teal-400 outline-none"
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
                  className="px-6 py-3 rounded-xl bg-teal-500 font-bold hover:bg-teal-400 transition"
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

              <div className="py-4 flex justify-center">
                <SafetyScoreRing score={95} size="lg" animate={true} />
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
                className="px-8 py-3 rounded-xl bg-teal-500 font-bold hover:bg-teal-400 transition mx-auto block"
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
              <p className="text-slate-300 text-sm max-w-md mx-auto">
                Your family workspace is ready. You can now scan medicine packs, search DRAP records, and consult verified doctors anytime.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 font-bold text-white shadow-xl hover:opacity-95 transition"
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
`);

console.log('Core Auth & Onboarding files written.');
`;

fs.writeFileSync(path.resolve(__dirname, 'generate_pages_part1.js'), content1, 'utf8');
console.log('Saved generate_pages_part1.js');
