import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Stethoscope, 
  AlertCircle, 
  ArrowRight, 
  Check,
  Eye,
  EyeOff,
  WifiOff,
  ShieldCheck,
  GitCompare,
  Brain
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validators } from '../../utils/validation';

const DOCTOR_SPECIALIZATIONS = [
  'General Physician / Family Medicine',
  'Internal Medicine',
  'Cardiology',
  'Endocrinology (Diabetes & Hormones)',
  'Nephrology',
  'Pulmonology (Chest & Asthma)',
  'Gastroenterology',
  'Neurology',
  'Psychiatry',
  'Pediatrics',
  'Gynecology & Obstetrics',
  'Dermatology',
  'Orthopedics',
  'ENT (Otolaryngology)',
  'Ophthalmology',
  'Oncology',
  'Urology'
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, doctorLogin, doctorSignup } = useAuth();
  
  const [role, setRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctorPass, setDoctorPass] = useState('');
  const [doctorMode, setDoctorMode] = useState('login'); // 'login' | 'register'
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('');
  const [docHospital, setDocHospital] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDoctorPassword, setShowDoctorPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Client-side validation
  const validateForm = () => {
    const errors = {};
    if (role === 'patient') {
      if (!email.trim()) {
        errors.email = 'Email address is required.';
      } else if (!validators.isValidEmail(email)) {
        errors.email = 'Please enter a valid email address.';
      }
      if (!password) {
        errors.password = 'Password is required.';
      } else if (!validators.isValidPassword(password)) {
        errors.password = 'Password must be at least 6 characters.';
      }
    } else if (doctorMode === 'register') {
      if (!docName.trim() || docName.trim().length < 2) {
        errors.docName = 'Full name is required (at least 2 characters).';
      }
      if (!docEmail.trim()) {
        errors.docEmail = 'Email address is required.';
      } else if (!validators.isValidEmail(docEmail)) {
        errors.docEmail = 'Please enter a valid email address.';
      }
      if (!doctorId.trim()) {
        errors.doctorId = 'Doctor ID / PMDC registration no. is required.';
      }
      if (!docSpecialization) {
        errors.docSpecialization = 'Please select your specialization.';
      }
      if (!docPass) {
        errors.doctorPass = 'Password is required.';
      } else if (!validators.isValidPassword(doctorPass)) {
        errors.doctorPass = 'Password must be at least 6 characters.';
      }
    } else {
      if (!doctorId.trim()) {
        errors.doctorId = 'Doctor ID is required.';
      }
      if (!doctorPass) {
        errors.doctorPass = 'Password is required.';
      } else if (!validators.isValidPassword(doctorPass)) {
        errors.doctorPass = 'Password must be at least 6 characters.';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Differentiate error types for better UX
  const getErrorMessage = (err) => {
    if (!err.response) {
      return 'Network error. Please check your internet connection and try again.';
    }
    const status = err.response.status;
    const serverMessage = err.response.data?.message;
    if (status === 401) {
      return 'Invalid credentials. Please verify your email and password.';
    }
    if (status === 429) {
      return 'Too many login attempts. Please wait a moment and try again.';
    }
    if (status === 500) {
      return 'Server is temporarily unavailable. Please try again in a few moments.';
    }
    return serverMessage || 'An unexpected error occurred. Please try again.';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    // Prevent multiple submissions
    if (loading) return;

    // Client-side validation
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (role === 'patient') {
        const res = await login(email.trim(), password);
        if (res?.user?.isFirstLogin) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else if (doctorMode === 'register') {
        await doctorSignup({
          name: docName.trim(),
          email: docEmail.trim(),
          doctorId: doctorId.trim(),
          specialization: docSpecialization,
          hospital: docHospital.trim(),
          password: docPass
        });
        navigate('/doctor-portal');
      } else {
        await doctorLogin(doctorId.trim(), doctorPass);
        navigate('/doctor-portal');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };



  const highlights = [];

  return (
    <div className="min-h-screen login-background text-slate-100 flex items-start justify-center pt-8 sm:pt-10 lg:pt-12 p-4 sm:px-6 lg:px-10 relative overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sea-green/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-sea-emerald/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
        
        {/* Left Column: Brand Story, Visual Showcase & Trust Elements */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-7 space-y-8 text-left"
        >
          {/* Brand Header */}
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900/80 p-2.5 shadow-glow-teal border border-sea-green/40 backdrop-blur-xl flex-shrink-0 flex items-center justify-center">
                <img 
                  src="/logo.jpg" 
                  alt="MedVigil AI Official Logo" 
                  className="w-full h-full object-contain rounded-2xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
                  MedVigil <span className="text-transparent bg-clip-text bg-gradient-to-r from-sea-light to-blue-400">AI</span>
                </h1>
                <p className="text-base sm:text-lg text-teal-200/90 font-medium mt-2">
                  AI-Powered Family Medicine Safety Assistant
                </p>
              </div>
            </div>

            <p className="text-lg sm:text-xl text-slate-200 leading-relaxed max-w-xl font-medium">
              Empowering Pakistani households to prevent adverse drug interactions, verify DRAP certifications, and safeguard their loved ones from preventable medication harm.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl font-normal">
              AI-powered medication safety and risk assessment for safer self-medication decisions.
            </p>
          </div>

          {/* Feature Cards — 2×2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { icon: ShieldCheck, title: 'DRAP Registry Integration', desc: 'Verify medicines against registered and regulatory information.' },
              { icon: GitCompare, title: 'Multi-Drug Interaction Radar', desc: 'Identify potential interactions when multiple medicines are taken together.' },
              { icon: Stethoscope, title: 'Doctor Telehealth Connect', desc: 'Connect users with doctors for professional medical guidance when needed.' },
              { icon: Brain, title: 'AI Risk Assessment', desc: 'Assess medication-related risks based on the user\u2019s medicines and safety factors.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="px-3.5 py-3 rounded-xl bg-gradient-to-br from-slate-800/80 to-med-navy/60 border border-white/10 flex items-start gap-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-sea-green/15 border border-sea-green/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-sea-light" size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white leading-tight">{title}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Strip */}
          <div className="flex items-center justify-center gap-x-3 py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-900/50 via-blue-800/40 to-blue-900/50 border border-blue-500/15">
            <span className="text-[11px] text-blue-100/90 font-medium whitespace-nowrap">265 Registered Pharmaceuticals</span>
            <span className="w-1 h-1 rounded-full bg-blue-300/50 flex-shrink-0" />
            <span className="text-[11px] text-blue-100/90 font-medium whitespace-nowrap">Zero-Harm Active Risk Engine</span>
            <span className="w-1 h-1 rounded-full bg-blue-300/50 flex-shrink-0" />
            <span className="text-[11px] text-blue-100/90 font-medium whitespace-nowrap">100% Free for Families</span>
          </div>

        </motion.div>

        {/* Right Column: Premium Glassmorphism Authentication Form */}
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0, ease: "easeOut" }}
          className="lg:col-span-5"
        >
          <div className="w-full backdrop-blur-2xl bg-slate-900/85 border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 text-white relative">
            
            {/* Header Title inside card */}
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {role === 'patient' ? 'Family Health Sign In' : doctorMode === 'register' ? 'Doctor Registration' : 'Doctor Clinical Portal'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {role === 'patient' 
                  ? 'Access your family safety scores & medicine vault' 
                  : doctorMode === 'register'
                    ? 'Create your clinical account for the doctor portal'
                    : 'Review patient inquiries & verify prescriptions'}
              </p>
            </div>

            {/* Role Switcher Pill */}
            <div className="flex bg-slate-950/80 p-1.5 rounded-2xl mb-6 border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => { setRole('patient'); setError(''); setFieldErrors({}); }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'patient'
                    ? 'bg-gradient-to-r from-sea-green to-teal-600 text-white shadow-lg shadow-teal-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                Patient / Family
              </button>
              <button
                type="button"
                onClick={() => { setRole('doctor'); setError(''); setFieldErrors({}); }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  role === 'doctor'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                Doctor Portal
              </button>
            </div>

            {/* Error Notification */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3.5 bg-red-500/15 border border-red-500/40 text-red-300 rounded-2xl text-xs flex items-start gap-2.5"
                >
                  {!error.includes('Network') ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                  ) : (
                    <WifiOff className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                  )}
                  <div>
                    <span>{error}</span>
                    <button 
                      onClick={() => setError('')} 
                      className="block mt-1 text-red-400 hover:text-red-300 font-bold underline text-[10px]"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {role === 'patient' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Family Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border text-white placeholder-slate-500 text-xs sm:text-sm focus:ring-2 outline-none transition ${
                          fieldErrors.email 
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' 
                            : 'border-white/15 focus:border-sea-light focus:ring-sea-light/20'
                        }`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="text-[11px] text-teal-300/80 hover:text-teal-200 font-medium transition"
                        tabIndex={-1}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 pr-11 rounded-xl bg-slate-950/60 border text-white placeholder-slate-500 text-xs sm:text-sm focus:ring-2 outline-none transition ${
                          fieldErrors.password 
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' 
                            : 'border-white/15 focus:border-sea-light focus:ring-sea-light/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sea-light transition p-1"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember Me Checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-4.5 h-4.5 w-[18px] h-[18px] rounded-md border-2 border-slate-600 bg-slate-950/60 peer-checked:bg-sea-green peer-checked:border-sea-green transition flex items-center justify-center group-hover:border-slate-400">
                        {rememberMe && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium group-hover:text-slate-300 transition">
                      Remember me on this device
                    </span>
                  </label>
                </>
              ) : (
                <>
                  {doctorMode === 'register' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={docName}
                          onChange={(e) => { setDocName(e.target.value); setFieldErrors(p => ({ ...p, docName: '' })); }}
                          placeholder="Dr. Ahmed Khan"
                          className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border text-white placeholder-slate-500 text-xs sm:text-sm focus:ring-2 outline-none transition ${
                            fieldErrors.docName
                              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                              : 'border-white/15 focus:border-blue-400 focus:ring-blue-400/20'
                          }`}
                        />
                        {fieldErrors.docName && (
                          <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {fieldErrors.docName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={docEmail}
                          onChange={(e) => { setDocEmail(e.target.value); setFieldErrors(p => ({ ...p, docEmail: '' })); }}
                          placeholder="doctor@hospital.pk"
                          className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border text-white placeholder-slate-500 text-xs sm:text-sm focus:ring-2 outline-none transition ${
                            fieldErrors.docEmail
                              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                              : 'border-white/15 focus:border-blue-400 focus:ring-blue-400/20'
                          }`}
                        />
                        {fieldErrors.docEmail && (
                          <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {fieldErrors.docEmail}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Doctor ID / Registration No.
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={doctorId}
                        onChange={(e) => { setDoctorId(e.target.value); setFieldErrors(p => ({ ...p, doctorId: '' })); }}
                        placeholder="e.g. DR-XXXX-XXX"
                        className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:ring-2 outline-none transition ${
                          fieldErrors.doctorId 
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' 
                            : 'border-white/15 focus:border-blue-400 focus:ring-blue-400/20'
                        }`}
                      />
                    </div>
                    {fieldErrors.doctorId && (
                      <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {fieldErrors.doctorId}
                      </p>
                    )}
                  </div>

                  {doctorMode === 'register' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Specialization
                        </label>
                        <select
                          required
                          value={docSpecialization}
                          onChange={(e) => { setDocSpecialization(e.target.value); setFieldErrors(p => ({ ...p, docSpecialization: '' })); }}
                          className={`w-full px-4 py-3 rounded-xl bg-slate-950/60 border text-white text-xs sm:text-sm focus:ring-2 outline-none transition ${
                            fieldErrors.docSpecialization
                              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                              : 'border-white/15 focus:border-blue-400 focus:ring-blue-400/20'
                          }`}
                        >
                          <option value="" disabled className="bg-slate-900">Select your specialization</option>
                          {DOCTOR_SPECIALIZATIONS.map((spec) => (
                            <option key={spec} value={spec} className="bg-slate-900">{spec}</option>
                          ))}
                        </select>
                        {fieldErrors.docSpecialization && (
                          <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {fieldErrors.docSpecialization}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Hospital / Clinic <span className="text-slate-500 font-medium normal-case">(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={docHospital}
                          onChange={(e) => setDocHospital(e.target.value)}
                          placeholder="e.g. Shifa International Hospital, Islamabad"
                          className="w-full px-4 py-3 rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-blue-400 focus:ring-blue-400/20 focus:ring-2 outline-none transition"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Doctor Password
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showDoctorPassword ? 'text' : 'password'}
                        required
                        value={doctorPass}
                        onChange={(e) => { setDoctorPass(e.target.value); setFieldErrors(p => ({ ...p, doctorPass: '' })); }}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 pr-11 rounded-xl bg-slate-950/60 border text-white placeholder-slate-500 text-xs sm:text-sm focus:ring-2 outline-none transition ${
                          fieldErrors.doctorPass 
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' 
                            : 'border-white/15 focus:border-blue-400 focus:ring-blue-400/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowDoctorPassword(!showDoctorPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-300 transition p-1"
                        tabIndex={-1}
                        aria-label={showDoctorPassword ? 'Hide password' : 'Show password'}
                      >
                        {showDoctorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {fieldErrors.doctorPass && (
                      <p className="text-[11px] text-red-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {fieldErrors.doctorPass}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-white text-xs sm:text-sm shadow-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  role === 'patient'
                    ? 'bg-gradient-to-r from-sea-green via-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 hover:shadow-teal-500/40 shadow-sea-green/30'
                    : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:shadow-blue-500/40 shadow-blue-600/30'
                } ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'}`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{role === 'doctor' && doctorMode === 'register' ? 'Creating doctor account...' : 'Signing in securely...'}</span>
                  </div>
                ) : (
                  <>
                    <span>
                      {role === 'patient' ? 'Enter Family Health Workspace' : doctorMode === 'register' ? 'Create Doctor Account' : 'Enter Doctor Clinical Inbox'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Registration CTA */}
            {role === 'patient' && (
              <div className="mt-5 text-center text-xs text-slate-400">
                New family on MedVigil?{' '}
                <Link to="/signup" className="text-sea-light font-bold hover:underline">
                  Create a Free Account
                </Link>
              </div>
            )}
            {role === 'doctor' && (
              <div className="mt-5 text-center text-xs text-slate-400">
                {doctorMode === 'login' ? (
                  <>
                    New doctor on MedVigil?{' '}
                    <button
                      type="button"
                      onClick={() => { setDoctorMode('register'); setError(''); setFieldErrors({}); }}
                      className="text-blue-300 font-bold hover:underline"
                    >
                      Register for Clinical Access
                    </button>
                  </>
                ) : (
                  <>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => { setDoctorMode('login'); setError(''); setFieldErrors({}); }}
                      className="text-blue-300 font-bold hover:underline"
                    >
                      Sign in instead
                    </button>
                  </>
                )}
              </div>
            )}


          </div>
        </motion.div>

      </div>
    </div>
  );
}
