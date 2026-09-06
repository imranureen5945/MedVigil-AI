import os

base_dir = r"C:\Users\User\.gemini\antigravity\scratch\medvigil-ai\client\src"

files = {
"pages/auth/LoginPage.jsx": """import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(role === 'patient' ? '/dashboard' : '/doctor-portal');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 to-blue-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/90 border border-white/20 rounded-2xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-teal-700 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">MedVigil AI</h1>
          <p className="text-gray-600 mt-2">{t('AI-Powered Family Medicine Safety')}</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-full mb-8">
          <button
            onClick={() => setRole('patient')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${role === 'patient' ? 'bg-white shadow text-teal-700' : 'text-gray-500'}`}
          >
            {t('Patient')}
          </button>
          <button
            onClick={() => setRole('doctor')}
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${role === 'doctor' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            {t('Doctor')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {role === 'patient' ? t('Email') : t('Doctor ID')}
            </label>
            <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('Password')}</label>
            <input type="password" required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-medium transition-colors">
            {loading ? t('Loading...') : t('Login')}
          </button>
        </form>

        {role === 'patient' && (
          <div className="text-center mt-6 text-sm text-gray-600">
            {t('New user?')} <Link to="/signup" className="text-teal-700 hover:underline">{t('Sign up')}</Link>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center text-sm text-gray-500 gap-2">
          <Lock className="w-4 h-4" />
          <span>{t('Your data is encrypted & private')}</span>
        </div>
      </motion.div>
    </div>
  );
}
""",
"pages/auth/SignupPage.jsx": """import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';

export default function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/onboarding');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 to-blue-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/90 border border-white/20 rounded-2xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-teal-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">{t('Create Account')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Full Name')}</label>
            <input type="text" required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Email')}</label>
            <input type="email" required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Password')}</label>
            <input type="password" required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Confirm Password')}</label>
            <input type="password" required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Language Preference')}</label>
            <select className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 outline-none">
              <option value="en">English</option>
              <option value="ur">Urdu</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full mt-4 py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-medium transition-colors">
            {loading ? t('Creating...') : t('Sign Up')}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          {t('Already have an account?')} <Link to="/login" className="text-teal-700 hover:underline">{t('Login')}</Link>
        </div>
        
        <div className="mt-6 flex justify-center text-gray-500">
            <span className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded-full"><Lock className="w-3 h-3"/> {t('Privacy protected')}</span>
        </div>
      </motion.div>
    </div>
  );
}
""",
"pages/onboarding/OnboardingPage.jsx": """import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Shield, Heart, Activity } from 'lucide-react';

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const nextStep = () => step < 4 ? setStep(step + 1) : navigate('/dashboard');
  const prevStep = () => step > 1 && setStep(step - 1);
  const skip = () => navigate('/dashboard');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-50 }} className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              <div className="relative">
                <Shield className="w-24 h-24 text-teal-600" />
                <Heart className="w-10 h-10 text-red-500 absolute bottom-0 right-0 bg-white rounded-full p-1 shadow" />
              </div>
              <h2 className="text-3xl font-bold mt-6 mb-4">{t('Welcome to MedVigil AI')}</h2>
              <p className="text-gray-600">{t('Your intelligent family medicine safety assistant. Keep your loved ones safe from medication errors.')}</p>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-50 }} className="flex-1 p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">{t('Add First Family Member')}</h2>
              <div className="space-y-4">
                <input type="text" placeholder={t('Name')} className="w-full p-3 border rounded-xl" />
                <input type="number" placeholder={t('Age')} className="w-full p-3 border rounded-xl" />
                <select className="w-full p-3 border rounded-xl bg-white">
                  <option>{t('Select Relation')}</option>
                  <option>{t('Self')}</option>
                  <option>{t('Parent')}</option>
                  <option>{t('Child')}</option>
                </select>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-50 }} className="flex-1 p-8 flex flex-col items-center text-center">
              <Activity className="w-20 h-20 text-blue-600 mb-6" />
              <h2 className="text-2xl font-bold mb-4">{t('Quick Tour')}</h2>
              <p className="text-gray-600 mb-8">{t('Scan medicines to instantly check for safety alerts, interactions, and DRAP notices.')}</p>
              <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center text-3xl font-bold text-green-600 shadow-inner">
                98
              </div>
              <p className="text-sm text-gray-500 mt-4">{t('Safety Score Indicator')}</p>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity:0, x:50 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-50 }} className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4">{t('All Set!')}</h2>
              <p className="text-gray-600 mb-8">{t('You are ready to manage your family\\'s medications safely.')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 border-t flex items-center justify-between bg-gray-50">
          <button onClick={skip} className="text-gray-500 font-medium px-4 py-2">{t('Skip')}</button>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full ${step === i ? 'bg-teal-600' : 'bg-gray-300'}`} />
            ))}
          </div>
          <button onClick={nextStep} className="bg-teal-600 text-white px-6 py-2 rounded-xl font-medium shadow-md hover:bg-teal-700">
            {step === 4 ? t('Go to Dashboard') : t('Next')}
          </button>
        </div>
      </div>
    </div>
  );
}
""",
"pages/dashboard/DashboardPage.jsx": """import React from 'react';
import HeroSection from './components/HeroSection';
import QuickActionCards from './components/QuickActionCards';
import ActiveProfileCard from './components/ActiveProfileCard';
import FamilyRiskWidget from './components/FamilyRiskWidget';
import AIInsightsPanel from './components/AIInsightsPanel';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <HeroSection />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <QuickActionCards />
            <AIInsightsPanel />
          </div>
          <div className="space-y-6">
            <ActiveProfileCard />
            <FamilyRiskWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
""",
"pages/dashboard/components/HeroSection.jsx": """import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between"
    >
      <div className="absolute inset-0 bg-white/10"></div>
      <div className="relative z-10 mb-6 md:mb-0">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('Good morning, Ahmed!')}</h1>
        <p className="text-teal-50 text-lg mb-4">{t('Your family\\'s medicine safety is looking good.')}</p>
        <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium border border-white/30">
          {t('Low Risk Status')}
        </span>
      </div>
      <div className="relative z-10">
        <div className="w-32 h-32 rounded-full border-8 border-green-400 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm shadow-xl">
          <span className="text-4xl font-bold">92</span>
          <span className="text-xs uppercase tracking-wide opacity-80">{t('Score')}</span>
        </div>
      </div>
    </motion.div>
  );
}
""",
"pages/dashboard/components/QuickActionCards.jsx": """import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ScanLine, GitCompare, ShieldAlert, Users, MessageCircle, ClipboardList } from 'lucide-react';

export default function QuickActionCards() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    { icon: ScanLine, title: 'Scan Medicine', desc: 'Scan label for instant checks', color: 'text-teal-600', bg: 'bg-teal-50', route: '/scan' },
    { icon: GitCompare, title: 'Drug Interactions', desc: 'Check medicine safety', color: 'text-blue-600', bg: 'bg-blue-50', route: '/drug-info' },
    { icon: ShieldAlert, title: 'DRAP Alerts', desc: 'View national safety notices', color: 'text-red-500', bg: 'bg-red-50', route: '/safety-center' },
    { icon: Users, title: 'Family Profiles', desc: 'Manage family health', color: 'text-purple-600', bg: 'bg-purple-50', route: '/family' },
    { icon: MessageCircle, title: 'Doctor Connect', desc: 'Consult with verified doctors', color: 'text-green-600', bg: 'bg-green-50', route: '/doctor-connect' },
    { icon: ClipboardList, title: 'Medicine History', desc: 'View past scans and logs', color: 'text-amber-500', bg: 'bg-amber-50', route: '/analytics' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate(action.route)}
          className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-slate-100"
        >
          <div className={`${action.bg} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
            <action.icon className={`${action.color} w-6 h-6`} />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">{t(action.title)}</h3>
          <p className="text-sm text-gray-500">{t(action.desc)}</p>
        </motion.div>
      ))}
    </div>
  );
}
""",
"pages/dashboard/components/ActiveProfileCard.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function ActiveProfileCard() {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-800">{t('Active Profile')}</h3>
        <Link to="/family" className="text-sm text-teal-600 hover:underline">{t('Switch')}</Link>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xl font-bold">
          SF
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900">Sara Fatima</h4>
          <p className="text-sm text-gray-500">Mother • 62 yrs</p>
        </div>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b border-gray-50">
          <span className="text-gray-500">{t('Active Medicines')}</span>
          <span className="font-semibold">4</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-50">
          <span className="text-gray-500">{t('Risk Level')}</span>
          <span className="text-green-600 font-semibold">{t('Low')}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-500">{t('Next Reminder')}</span>
          <span className="font-semibold text-gray-800">8:00 PM</span>
        </div>
      </div>
    </div>
  );
}
""",
"pages/dashboard/components/FamilyRiskWidget.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function FamilyRiskWidget() {
  const { t } = useTranslation();
  const members = [
    { name: 'Self', score: 98, color: 'bg-green-500' },
    { name: 'Sara Fatima', score: 92, color: 'bg-green-500' },
    { name: 'Ali Raza', score: 75, color: 'bg-amber-500' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">{t('Family Risk Overview')}</h3>
        <Link to="/analytics" className="text-sm text-teal-600 hover:underline">{t('View all')}</Link>
      </div>
      <div className="space-y-4">
        {members.map((m, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                {m.name[0]}
              </div>
              <span className="font-medium text-gray-700">{m.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{m.score}</span>
              <div className={`w-3 h-3 rounded-full ${m.color}`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
""",
"pages/dashboard/components/AIInsightsPanel.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, AlertTriangle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AIInsightsPanel() {
  const { t } = useTranslation();
  const insights = [
    { icon: AlertTriangle, msg: 'Possible interaction between Aspirin & Ibuprofen', type: 'warning', color: 'text-amber-500', bg: 'bg-amber-50' },
    { icon: Clock, msg: '2 medicines expiring in next 30 days', type: 'info', color: 'text-blue-500', bg: 'bg-blue-50' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-teal-600 w-5 h-5" />
        <h3 className="font-bold text-gray-800">{t('AI Health Insights')}</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className={`p-4 rounded-xl flex items-start gap-3 ${insight.bg}`}>
            <insight.icon className={`${insight.color} w-5 h-5 mt-0.5`} />
            <div>
              <p className="text-gray-800 text-sm font-medium">{t(insight.msg)}</p>
              <Link to="/safety-center" className={`text-xs ${insight.color} hover:underline font-semibold mt-1 inline-block`}>{t('Take action')}</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
""",
"pages/drug-info/DrugInfoPage.jsx": """import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Pill } from 'lucide-react';
import MedicineCard from './components/MedicineCard';

export default function DrugInfoPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 2) {
      setResults([
        { id: 1, brand: 'Panadol', generic: 'Paracetamol', manufacturer: 'GSK', category: 'Analgesic', isVerified: true },
        { id: 2, brand: 'Augmentin', generic: 'Amoxicillin + Clavulanate', manufacturer: 'GSK', category: 'Antibiotic', isVerified: true }
      ]);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input 
            type="text" 
            value={query}
            onChange={handleSearch}
            placeholder={t('Search medicines by name...')}
            className="w-full pl-12 pr-4 py-4 rounded-2xl shadow-sm border border-gray-200 text-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map(med => <MedicineCard key={med.id} medicine={med} />)}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
            <Pill className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600">{t('Search for any medicine registered in Pakistan')}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
""",
"pages/drug-info/components/MedicineCard.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';

export default function MedicineCard({ medicine }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{medicine.brand}</h3>
          <p className="text-sm text-gray-500">{medicine.generic}</p>
        </div>
        {medicine.isVerified && (
          <div className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md">
            <ShieldCheck className="w-4 h-4" /> DRAP Verified
          </div>
        )}
      </div>
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p><span className="font-medium text-gray-800">{t('Manufacturer')}:</span> {medicine.manufacturer}</p>
        <p><span className="font-medium text-gray-800">{t('Category')}:</span> {medicine.category}</p>
      </div>
      <button className="mt-5 w-full py-2 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors">
        {t('Check Interactions')}
      </button>
    </div>
  );
}
""",
"pages/scan-medicine/ScanMedicinePage.jsx": """import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react';
import ScanResultCard from './components/ScanResultCard';

export default function ScanMedicinePage() {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleImage = (e) => {
    if(e.target.files && e.target.files[0]) {
      const imgUrl = URL.createObjectURL(e.target.files[0]);
      setImage(imgUrl);
      scanImage();
    }
  };

  const scanImage = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setResult({
        name: 'Panadol Extra',
        generic: 'Paracetamol + Caffeine',
        usage: 'Pain Relief',
        dosage: '1-2 tablets every 4-6 hours',
        isVerified: true
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('Scan Medicine Label')}</h1>
      
      {!result ? (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6 relative">
          <label className="border-4 border-dashed border-teal-200 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition-colors relative overflow-hidden">
            <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            {image ? (
              <>
                <img src={image} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                {scanning && (
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.5)] z-10"
                  />
                )}
              </>
            ) : (
              <div className="text-center text-teal-600">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-80" />
                <p className="font-semibold text-lg">{t('Tap to Scan Medicine')}</p>
                <p className="text-sm opacity-70 mt-2">{t('or upload from gallery')}</p>
              </div>
            )}
          </label>
          {scanning && <p className="text-center mt-4 text-teal-700 font-medium animate-pulse">{t('Analyzing label with AI...')}</p>}
        </div>
      ) : (
        <ScanResultCard result={result} onReset={() => { setResult(null); setImage(null); }} />
      )}
    </div>
  );
}
""",
"pages/scan-medicine/components/ScanResultCard.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScanResultCard({ result, onReset }) {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-teal-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">{result.name}</h2>
        <p className="opacity-90">{result.generic}</p>
      </div>
      <div className="p-6 space-y-4">
        {result.isVerified && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-xl font-medium">
            <ShieldCheck className="w-5 h-5" />
            {t('Verified by DRAP')}
          </div>
        )}
        <div className="space-y-3 text-sm">
          <div><span className="text-gray-500 block mb-1">{t('Usage')}</span><div className="p-3 bg-gray-50 rounded-xl font-medium">{result.usage}</div></div>
          <div><span className="text-gray-500 block mb-1">{t('Standard Dosage')}</span><div className="p-3 bg-gray-50 rounded-xl font-medium">{result.dosage}</div></div>
        </div>

        <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{t('No major interactions found with your current active profile.')}</p>
        </div>

        <div className="pt-4 flex gap-3">
          <button className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> {t('Add to History')}
          </button>
          <button onClick={onReset} className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
""",
"pages/safety-center/SafetyCenterPage.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SafetyCenterPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">{t('Medicine Safety Center')}</h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['All', 'Critical', 'Warnings', 'Safe'].map(tab => (
            <button key={tab} className="px-5 py-2 rounded-full font-medium text-sm whitespace-nowrap bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
              {t(tab)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="bg-white border-l-4 border-red-500 rounded-r-xl shadow-sm p-5 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 text-lg">High-Risk Interaction</h3>
              <p className="text-gray-600 mt-1 text-sm">Aspirin and Ibuprofen taken together can increase bleeding risk. Consult your doctor immediately.</p>
              <div className="mt-3 flex gap-3 text-sm font-medium">
                <button className="text-red-600 hover:underline">{t('View Details')}</button>
                <button className="text-teal-600 hover:underline">{t('Consult Doctor')}</button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
""",
"pages/describe-symptoms/DescribeSymptomsPage.jsx": """import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stethoscope, AlertTriangle, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DescribeSymptomsPage() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <p className="text-amber-800 text-sm font-medium">{t('AI provides information only — not medical recommendations. For personalized advice, connect with a doctor.')}</p>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <Stethoscope className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t('Describe Your Symptoms')}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <textarea 
            rows={5}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none text-gray-800"
            placeholder={t("Tell us what you're experiencing...")}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => setSubmitted(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
            >
              {t('Get AI Guidance')} <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {submitted && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">{t('AI Analysis')}</h3>
              <p className="text-gray-600 mb-4">{t('Based on your symptoms, here are common over-the-counter considerations. Please verify with a doctor.')}</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                <h4 className="font-semibold text-gray-800">Paracetamol (Panadol)</h4>
                <p className="text-sm text-gray-600 mt-1">Used for: Mild to moderate pain and fever relief.</p>
              </div>
              <button className="w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-100 transition-colors">
                {t('Consult a Verified Doctor')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
""",
"pages/amr/AMRPage.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, ShieldCheck, AlertOctagon } from 'lucide-react';

export default function AMRPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-lg flex items-center gap-6">
          <Bug className="w-16 h-16 opacity-80" />
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('Antimicrobial Resistance (AMR)')}</h1>
            <p className="text-purple-100 text-lg">{t('A growing silent pandemic in Pakistan.')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><AlertOctagon className="text-amber-500 w-5 h-5"/> {t('Common Causes')}</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"/> Self-medication without prescription</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"/> Not completing the antibiotic course</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"/> Overuse of antibiotics for viral infections</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck className="text-green-500 w-5 h-5"/> {t('How to Protect')}</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"/> Only use antibiotics prescribed by a doctor</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"/> Always complete the full prescribed course</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"/> Never share antibiotics with others</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
""",
"pages/family-profile/FamilyProfilePage.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus } from 'lucide-react';
import AddFamilyMemberModal from './components/AddFamilyMemberModal';

export default function FamilyProfilePage() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = React.useState(false);

  const members = [
    { id: 1, name: 'Ahmed', age: 35, relation: 'Self', score: 98, meds: 1, active: true },
    { id: 2, name: 'Sara Fatima', age: 62, relation: 'Mother', score: 92, meds: 4, active: false }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t('Family Profiles')}</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2">
            <Plus className="w-5 h-5" /> {t('Add Member')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <div key={member.id} className={`bg-white rounded-2xl p-6 cursor-pointer transition-all ${member.active ? 'ring-2 ring-teal-500 shadow-md' : 'border border-gray-200 hover:shadow-md'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-xl font-bold">
                  {member.name.substring(0,2).toUpperCase()}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-500">{member.score}</div>
                  <div className="text-xs text-gray-400">Score</div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.relation} • {member.age} yrs</p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500">{t('Medicines')}</span>
                <span className="font-semibold">{member.meds} active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && <AddFamilyMemberModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
""",
"pages/family-profile/components/AddFamilyMemberModal.jsx": """import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export default function AddFamilyMemberModal({ onClose }) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">{t('Add Family Member')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Name')}</label>
            <input type="text" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Age')}</label>
            <input type="number" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Relation')}</label>
            <select className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white">
              <option>Parent</option><option>Child</option><option>Spouse</option><option>Other</option>
            </select>
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-200 rounded-xl">{t('Cancel')}</button>
          <button onClick={onClose} className="px-6 py-2 font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl">{t('Save')}</button>
        </div>
      </motion.div>
    </div>
  );
}
""",
"pages/emergency-guide/EmergencyGuidePage.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Printer } from 'lucide-react';

export default function EmergencyGuidePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg border-t-8 border-red-500 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">{t('Emergency Information')}</h1>
          </div>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><Printer className="w-6 h-6"/></button>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-gray-700 text-lg mb-2">{t('Blood Type')}</label>
              <select className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl bg-white focus:border-red-500 outline-none">
                <option>O+</option><option>A+</option><option>B+</option><option>AB+</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 text-lg mb-2">{t('Emergency Contact')}</label>
              <input type="text" placeholder="Name & Phone" className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block font-bold text-gray-700 text-lg mb-2">{t('Known Allergies')}</label>
            <textarea rows={3} className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none resize-none" placeholder="Penicillin, Peanuts, etc." />
          </div>
          <div>
            <label className="block font-bold text-gray-700 text-lg mb-2">{t('Critical Medications')}</label>
            <textarea rows={3} className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none resize-none" placeholder="Insulin, Inhalers, etc." />
          </div>
          <button className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg transition-colors">
            {t('Save Information')}
          </button>
        </div>
      </div>
    </div>
  );
}
""",
"pages/doctor-connect/DoctorConnectPage.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import MessageComposer from './components/MessageComposer';
import { ShieldCheck } from 'lucide-react';

export default function DoctorConnectPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex">
      <div className="w-80 bg-white border-r border-gray-200 p-4 hidden md:block">
        <h2 className="font-bold text-lg mb-4">{t('Verified Doctors')}</h2>
        <div className="space-y-2">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 cursor-pointer flex gap-3 items-center">
            <div className="w-12 h-12 bg-teal-200 rounded-full flex-shrink-0"></div>
            <div>
              <h4 className="font-bold text-gray-900 flex items-center gap-1">Dr. Faisal <ShieldCheck className="w-4 h-4 text-teal-600"/></h4>
              <p className="text-xs text-gray-500">General Physician</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="p-4 border-b bg-white flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-200 rounded-full md:hidden"></div>
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-1">Dr. Faisal Maqsood <ShieldCheck className="w-4 h-4 text-teal-600"/></h3>
            <p className="text-xs text-green-600 font-medium">Online</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-end">
            <div className="bg-teal-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[80%]">
              Hello doctor, my mother's blood pressure is 150/90. She takes Amlodipine. Should I give her another dose?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm">
              Please do not give an extra dose without consultation. Monitor her BP for another hour. If it doesn't reduce or she has symptoms like headache or dizziness, take her to the ER.
            </div>
          </div>
        </div>
        <div className="p-4 bg-white border-t">
          <MessageComposer />
        </div>
      </div>
    </div>
  );
}
""",
"pages/doctor-connect/components/MessageComposer.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Paperclip } from 'lucide-react';

export default function MessageComposer() {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-2">
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full cursor-pointer hover:bg-gray-200">Routine</span>
        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full cursor-pointer hover:bg-amber-200">Concerning</span>
        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full cursor-pointer hover:bg-red-200">Urgent</span>
      </div>
      <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent">
        <button className="p-2 text-gray-400 hover:text-teal-600 rounded-full"><Paperclip className="w-5 h-5"/></button>
        <textarea 
          rows={1}
          placeholder={t('Type your message...')}
          className="flex-1 bg-transparent border-none outline-none resize-none py-2 max-h-32 text-gray-800"
        />
        <button className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl mb-0.5 shadow-sm transition-colors">
          <Send className="w-5 h-5"/>
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center">Your active profile's medicine list will be securely attached.</p>
    </div>
  );
}
""",
"pages/doctor-connect/components/MessageStatusTracker.jsx": """import React from 'react';

export default function MessageStatusTracker({ status }) {
  return (
    <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mt-1 mr-2 justify-end">
      <span className={status === 'sent' || status === 'seen' || status === 'replied' ? 'text-teal-600' : ''}>Sent</span>
      <span>→</span>
      <span className={status === 'seen' || status === 'replied' ? 'text-teal-600' : ''}>Seen</span>
      <span>→</span>
      <span className={status === 'replied' ? 'text-teal-600' : ''}>Replied</span>
    </div>
  );
}
""",
"pages/doctor-portal/DoctorInboxPage.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import PatientMessageCard from './components/PatientMessageCard';

export default function DoctorInboxPage() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="font-bold text-xl">MedVigil AI - Doctor Portal</h1>
        <button className="text-sm font-medium hover:underline">Logout</button>
      </header>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('Patient Inbox')}</h2>
        <PatientMessageCard urgency="urgent" patientName="Sara Fatima" time="10 mins ago" />
        <PatientMessageCard urgency="concerning" patientName="Ahmed Ali" time="1 hour ago" />
        <PatientMessageCard urgency="routine" patientName="Zainab Khan" time="3 hours ago" />
      </div>
    </div>
  );
}
""",
"pages/doctor-portal/components/PatientMessageCard.jsx": """import React, { useState } from 'react';
import { AlertCircle, User } from 'lucide-react';
import ReplyBox from './ReplyBox';

export default function PatientMessageCard({ urgency, patientName, time }) {
  const [expanded, setExpanded] = useState(false);
  
  const bg = urgency === 'urgent' ? 'border-red-500 bg-red-50' : urgency === 'concerning' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white';
  
  return (
    <div className={`border-l-4 rounded-r-2xl shadow-sm overflow-hidden ${bg}`}>
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500"/>
            <h3 className="font-bold text-gray-900">{patientName}</h3>
          </div>
          <span className="text-xs font-medium text-gray-500">{time}</span>
        </div>
        <p className="text-gray-700 text-sm">Patient reported high blood pressure (150/90). Needs advice on medication dosage adjustment.</p>
        {urgency === 'urgent' && <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded"><AlertCircle className="w-3 h-3"/> URGENT</div>}
      </div>
      
      {expanded && (
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="bg-slate-50 p-3 rounded-lg text-xs text-gray-600 mb-4 border border-slate-100">
            <strong>Context Snapshot:</strong> Active Meds: Amlodipine 5mg. Safety Score: 92. Age: 62.
          </div>
          <ReplyBox />
        </div>
      )}
    </div>
  );
}
""",
"pages/doctor-portal/components/ReplyBox.jsx": """import React from 'react';
import { Send, ShieldCheck } from 'lucide-react';

export default function ReplyBox() {
  return (
    <div className="space-y-3">
      <textarea 
        rows={3} 
        placeholder="Type your medical advice..."
        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
          Mark as Doctor Verified <ShieldCheck className="w-4 h-4 text-green-500"/>
        </label>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          Send Reply <Send className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
}
""",
"pages/analytics/AnalyticsPage.jsx": """import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t('Health Analytics')}</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <TrendingUp className="w-6 h-6 text-blue-500 mb-2" />
            <div className="text-3xl font-bold text-gray-900">42</div>
            <div className="text-sm text-gray-500">{t('Total Scans')}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
            <div className="text-3xl font-bold text-gray-900">92</div>
            <div className="text-sm text-gray-500">{t('Avg Safety Score')}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <AlertTriangle className="w-6 h-6 text-amber-500 mb-2" />
            <div className="text-3xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-500">{t('Alerts This Month')}</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <BarChart3 className="w-6 h-6 text-purple-500 mb-2" />
            <div className="text-3xl font-bold text-gray-900">4</div>
            <div className="text-sm text-gray-500">{t('Active Profiles')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
            <p className="text-gray-400 font-medium">Safety Score Trends Chart (Recharts Placeholder)</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
            <p className="text-gray-400 font-medium">Antibiotic Usage Pie Chart (Recharts Placeholder)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
"""
}

for rel, content in files.items():
    full_path = os.path.join(base_dir, rel.replace('/', os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
print("All pages created successfully.")
