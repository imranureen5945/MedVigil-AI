import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Pill,
  Stethoscope,
  Users,
  AlertTriangle,
  MessageCircle,
  BarChart3,
  LogOut,
  X,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  FileText,
  Rocket
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout, user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: 'Live' },
    { to: '/drug-info', icon: Pill, label: 'Drug Directory (DRAP)' },
    { to: '/describe-symptoms', icon: Stethoscope, label: 'Risk Assessment', badge: 'AI Safety' },
    { to: '/family-profile', icon: Users, label: 'Family Safety Vault' },
    { to: '/emergency-guide', icon: AlertTriangle, label: 'Emergency Guide' },
    { to: '/analytics', icon: BarChart3, label: 'Safety Analytics' },
    { to: '/doctor-connect', icon: MessageCircle, label: 'Doctor Tele-Connect' },
    { to: '/future-vision', icon: Rocket, label: 'Future Vision', badge: 'SOON' },
  ];

  return (
    <>
      {/* Mobile / Tablet backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-gradient-to-b from-med-dark via-slate-900 to-med-navy border-r border-white/10 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header & Navigation Section */}
        <div className="flex flex-col flex-1 min-h-0">
          
          {/* Official MedVigil AI Brand Header */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-white/10 bg-slate-950/40">
            <Link to="/dashboard" className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-2xl bg-slate-950 p-1.5 border border-sea-green/40 shadow-glow-teal flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/logo.jpg" 
                  alt="MedVigil AI Official Logo" 
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight text-white leading-none">
                    MedVigil <span className="text-sea-light">AI</span>
                  </span>
                </div>
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sea-light animate-pulse" />
                  Medicine Safety
                </span>
              </div>
            </Link>

            <button 
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition" 
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav List with Full Visibility & Rich Hover Effects */}
          <nav className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              Navigation Menu
            </div>

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 relative overflow-hidden
                  ${isActive 
                    ? 'bg-gradient-to-r from-sea-green via-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-950/50 scale-[1.01]' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10 hover:translate-x-1'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'text-slate-400 group-hover:text-sea-light group-hover:bg-white/5 group-hover:rotate-6'
                      }`}>
                        <item.icon size={18} className="shrink-0" />
                      </div>
                      <span className="truncate tracking-tight">{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isActive 
                          ? 'bg-white/25 text-white' 
                          : 'bg-sea-green/20 text-sea-light border border-sea-green/30 group-hover:bg-sea-green group-hover:text-white'
                      }`}>
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight size={14} className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ${isActive ? 'opacity-100 translate-x-0' : 'text-slate-400'}`} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

        </div>

        {/* Bottom User Profile & Logout Action */}
        <div className="p-3.5 border-t border-white/10 bg-slate-950/60 space-y-2">
          <div className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sea-green to-teal-700 text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-sea-light font-semibold truncate">
                  Family Account
                </p>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-slate-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs font-bold border border-transparent hover:border-red-500/30"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>
    </>
  );
}
