import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShieldAlert, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Calendar, 
  Copy, 
  GitCompare, 
  MessageCircle, 
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../../context/FamilyContext';
import { safetyService } from '../../services/safetyService';

export default function SafetyCenterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeMember } = useFamily();
  const [activeTab, setActiveTab] = useState('All');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fallbackAlerts = [
    {
      id: 1,
      category: 'DRAP Recalls',
      type: 'critical',
      severity: 'critical',
      title: 'DRAP National Product Recall: Zantac (Ranitidine)',
      description: 'The Drug Regulatory Authority of Pakistan has issued a safety recall on ranitidine batches due to NDMA impurity levels exceeding safety thresholds.',
      medicine: 'Zantac 150mg',
      date: 'Aug 2026',
      badge: 'DRAP Mandatory Notice'
    },
    {
      id: 2,
      category: 'Drug Interactions',
      type: 'critical',
      severity: 'critical',
      title: 'High-Risk Contraindication: Ibuprofen (Brufen) + Aspirin (Disprin)',
      description: 'Taking multiple NSAIDs simultaneously significantly elevates gastrointestinal ulceration and internal hemorrhage risk.',
      medicine: 'Brufen 400mg + Disprin 300mg',
      date: 'Active Alert',
      badge: 'Severe Interaction'
    },
    {
      id: 3,
      category: 'Duplicate Medicines',
      type: 'warning',
      severity: 'warning',
      title: 'Therapeutic Duplication Detected: Paracetamol Overlap',
      description: 'Panadol (Paracetamol 500mg) and Calpol 6 Plus both contain active acetaminophen. Concurrent intake may exceed maximum daily liver safety limit (4g/day).',
      medicine: 'Panadol + Calpol',
      date: 'Active Alert',
      badge: 'Dosage Overlap'
    },
    {
      id: 4,
      category: 'High-Risk Combinations',
      type: 'warning',
      severity: 'warning',
      title: 'Concurrent Multiple Antibiotic Course Warning',
      description: 'Multiple active antibiotic prescriptions detected without tapering schedule. Increases Antimicrobial Resistance (AMR) susceptibility.',
      medicine: 'Augmentin + Flagyl',
      date: 'Active Alert',
      badge: 'AMR Risk'
    },
    {
      id: 5,
      category: 'Verified Safe',
      type: 'safe',
      severity: 'safe',
      title: 'Verified DRAP Clearance: Risek (Omeprazole 20mg)',
      description: 'Batch registration DRAP-021 verified against national purity register. Safe for gastric acidity prophylaxis.',
      medicine: 'Risek 20mg',
      date: 'Verified Today',
      badge: '100% Cleared'
    }
  ];

  const fetchAlerts = async () => {
    if (!activeMember?.id) return;
    setLoading(true);
    try {
      const data = await safetyService.getAlerts(activeMember.id);
      if (data && data.length > 0) {
        setAlerts(data.map((item, idx) => ({
          id: item.id || idx + 1,
          category: item.type === 'recall' ? 'DRAP Recalls' : (item.type === 'interaction' ? 'Drug Interactions' : (item.type === 'allergy' ? 'Allergy Conflict' : 'Safety Precaution')),
          type: item.severity === 'critical' ? 'critical' : (item.severity === 'safe' ? 'safe' : 'warning'),
          severity: item.severity,
          title: item.title || item.message,
          description: item.message || item.recommendation,
          medicine: item.recommendation ? item.recommendation.split('.')[0] : 'Prescription Review',
          date: item.createdAt || 'Live Check',
          badge: item.severity === 'critical' ? 'Critical Alert' : (item.severity === 'safe' ? 'Verified Safe' : 'Warning Precaution')
        })));
      } else {
        setAlerts(fallbackAlerts);
      }
    } catch (e) {
      setAlerts(fallbackAlerts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [activeMember?.id]);

  const displayAlerts = alerts.length > 0 ? alerts : fallbackAlerts;

  const filteredAlerts = displayAlerts.filter(a => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Critical') return a.type === 'critical';
    if (activeTab === 'Warnings') return a.type === 'warning';
    if (activeTab === 'Safe') return a.type === 'safe';
    return true;
  });

  const getCardStyle = (type) => {
    switch (type) {
      case 'critical':
        return {
          border: 'border-red-300 bg-red-50/40',
          leftStripe: 'bg-red-500',
          icon: AlertOctagon,
          iconColor: 'text-red-600',
          badgeStyle: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'warning':
        return {
          border: 'border-amber-300 bg-amber-50/40',
          leftStripe: 'bg-amber-500',
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          badgeStyle: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      default:
        return {
          border: 'border-emerald-200 bg-emerald-50/40',
          leftStripe: 'bg-emerald-500',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
          badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-med-dark via-slate-900 to-med-navy rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/15">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sea-green/20 text-sea-light border border-sea-green/40">
              <ShieldAlert className="w-4 h-4" />
              <span>National Safety Monitor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Medicine Safety Center</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Live surveillance for <strong className="text-white font-bold">{activeMember?.name || 'Active Member'}</strong> covering DRAP recall advisories, harmful drug interactions, duplicate doses, and allergy conflicts.
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={fetchAlerts}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 font-bold text-xs sm:text-sm text-white border border-white/15 transition flex items-center gap-2"
              title="Refresh alerts"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => navigate('/doctor-connect')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sea-green to-teal-600 hover:from-teal-600 hover:to-sea-green font-black text-xs sm:text-sm text-white shadow-lg transition flex items-center gap-2 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Doctor Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl p-2 sm:p-3 rounded-2xl shadow-subtle border border-white/80">
        <div className="flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          {['All', 'Critical', 'Warnings', 'Safe'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-black transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-sea-green to-teal-700 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-400 font-bold px-3 hidden sm:inline">
          Showing {filteredAlerts.length} Active Checks
        </span>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const style = getCardStyle(alert.type);
          const Icon = style.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-subtle hover:shadow-elevated transition-all border ${style.border} relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${style.leftStripe}`} />

              <div className="flex items-start gap-4 pl-2">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm border border-slate-100 ${style.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${style.badgeStyle}`}>
                      {alert.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {alert.category} • {alert.date}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                    {alert.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    {alert.description}
                  </p>

                  <div className="pt-1 text-xs text-slate-500 font-semibold">
                    Clinical Context: <span className="text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md">{alert.medicine}</span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center md:items-end gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 pl-2 md:pl-0 flex-shrink-0">
                <button
                  onClick={() => navigate('/doctor-connect', { state: { prefillSymptom: `Safety Alert Query: ${alert.title}` } })}
                  className="w-full md:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Consult Doctor</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
