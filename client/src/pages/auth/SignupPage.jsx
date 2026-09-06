import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertCircle, CheckCircle2, HeartHandshake, Activity, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validators } from '../../utils/validation';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission
    setError('');

    // Client-side validation
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!validators.isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validators.isValidPassword(password)) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim().toLowerCase(), password, language: 'en' });
      navigate('/onboarding');
    } catch (err) {
      console.error('Signup error:', err);
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      
      if (status === 400 && serverMsg) {
        setError(serverMsg);
      } else if (status === 429) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else if (status >= 500) {
        setError('Server is currently unavailable. Please try again in a moment.');
      } else if (!err.response) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(serverMsg || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen login-background text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sea-green/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Side: Brand Story */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 space-y-6 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-900/80 p-2 shadow-glow-teal border border-sea-green/40 backdrop-blur-xl flex-shrink-0 flex items-center justify-center">
              <img 
                src="/logo.jpg" 
                alt="MedVigil AI Official Logo" 
                className="w-full h-full object-contain rounded-2xl"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">
                MedVigil <span className="text-transparent bg-clip-text bg-gradient-to-r from-sea-light to-blue-400">AI</span>
              </h1>
              <p className="text-xs sm:text-sm text-teal-200/90 font-semibold mt-1">
                Family Medicine Safety Architecture
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              Create Your Household Safety Vault
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Join thousands of families in Pakistan safeguarding themselves from preventable medicine interactions, accidental overdoses, and unverified formulations.
            </p>
          </div>

          <div className="space-y-2.5 pt-2 text-xs">
            <div className="flex items-center gap-2.5 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-sea-emerald flex-shrink-0" />
              <span>Multi-profile support for Parents, Children & Grandparents</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-sea-emerald flex-shrink-0" />
              <span>Instant AI Camera & Strip Label OCR Recognition</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-sea-emerald flex-shrink-0" />
              <span>Direct Telehealth Consultation with Verified Doctors</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Registration Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-6"
        >
          <div className="backdrop-blur-2xl bg-slate-900/85 border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 text-white relative">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Register Family Account</h2>
              <p className="text-xs text-slate-400 mt-1">Start protecting your household in under 60 seconds</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-500/40 text-red-300 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Primary Guardian / Head of Family
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ahmed Khan"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-sea-light focus:ring-2 focus:ring-sea-light/20 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="family@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-sea-light focus:ring-2 focus:ring-sea-light/20 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full px-4 py-2.5 pr-9 rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-sea-light focus:ring-2 focus:ring-sea-light/20 outline-none transition"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Confirm
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat"
                      className="w-full px-4 py-2.5 pr-9 rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-sea-light focus:ring-2 focus:ring-sea-light/20 outline-none transition"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-extrabold text-white text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 bg-gradient-to-r from-sea-green via-teal-600 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-sea-green/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Family Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="text-sea-light font-bold hover:underline">
                Sign in here
              </Link>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-sea-light" />
              <span>DRAP Verified & 256-bit Encrypted Health Data</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
