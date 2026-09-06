import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  User, 
  Send, 
  Paperclip, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Stethoscope,
  Info,
  Pill,
  Activity,
  Zap,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageComposer from './components/MessageComposer';
import MessageStatusTracker from './components/MessageStatusTracker';

import { doctorConnectService } from '../../services/doctorConnectService';
import { useFamily } from '../../context/FamilyContext';

export default function DoctorConnectPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { activeMember } = useFamily();
  
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDoctors = async () => {
    try {
      const data = await doctorConnectService.getDoctors();
      if (data && data.length > 0) {
        const mapped = data.map(d => ({
          id: d.id,
          doctorId: d.doctorId || '',
          name: d.name || 'Doctor',
          title: d.title || (d.specialization ? `Consultant ${d.specialization}` : 'Consultant'),
          specialization: d.specialization || 'General Practice',
          qualification: d.qualification || '',
          photo: d.photo || '',
          intro: d.intro || '',
          availability: d.availability || 'Available',
          avatarText: (d.name || 'DR').split(' ').filter(w => w[0] === w[0].toUpperCase()).map(w => w[0]).join('').substring(0, 2) || 'DR',
          online: true,
          experience: d.experience || '',
          hospital: d.hospital || 'Telehealth Unit'
        }));
        setDoctors(mapped);
        setSelectedDoctor(mapped[0]);
      }
    } catch (e) {
      console.error('Failed to load doctors:', e);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await doctorConnectService.getPatientMessages();
      if (msgs && msgs.length > 0) {
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDoctors();
    loadMessages();
  }, []);

  const handleMessageSent = (newMsg) => {
    setMessages(prev => [...prev, newMsg]);
  };

  const filteredMessages = selectedDoctor
    ? messages.filter(
        m => !m.doctorId || m.doctorId === selectedDoctor.id || m.doctorId === selectedDoctor.doctorId
      )
    : [];

  if (!selectedDoctor) {
    return (
      <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] min-h-[600px] flex items-center justify-center rounded-3xl shadow-xl border border-white/80 bg-white/90 backdrop-blur-2xl">
        <div className="text-center p-8 space-y-3">
          <div className="w-16 h-16 bg-teal-50 text-sea-green rounded-2xl flex items-center justify-center mx-auto border border-teal-100">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h3 className="font-black text-base text-slate-800">No Doctors Available</h3>
          <p className="text-sm text-slate-500 max-w-sm">Doctor telehealth accounts will appear here once registered on the platform.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] min-h-[600px] flex flex-col md:flex-row rounded-3xl shadow-xl border border-white/80 overflow-hidden bg-white/90 backdrop-blur-2xl">
      
      {/* Left Sidebar: Doctor Selection Panel */}
      <div className="w-full md:w-80 border-r border-slate-200/70 bg-gradient-to-b from-slate-900 via-med-navy to-slate-950 p-4 flex flex-col justify-between text-white">
        <div>
          {/* Section Header */}
          <div className="flex items-center gap-2.5 mb-5 px-2">
            <div className="w-8 h-8 rounded-xl bg-sea-green/20 border border-sea-green/40 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-sea-light" />
            </div>
            <div>
              <h2 className="font-black text-xs uppercase tracking-wider text-white">
                Doctors
              </h2>
              <p className="text-[10px] text-teal-300 font-semibold">Telehealth Connect</p>
            </div>
          </div>

          {/* Doctor Cards */}
          <div className="space-y-2.5">
            {doctors.map((doc) => {
              const isSelected = selectedDoctor?.id === doc.id;
              return (
                <motion.div
                  key={doc.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-sea-green to-teal-700 border-sea-light/40 shadow-lg shadow-sea-green/20'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 overflow-hidden ${
                      isSelected ? 'bg-white/20 text-white shadow-md' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {doc.photo ? (
                        <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                      ) : (
                        doc.avatarText
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                          {doc.name}
                        </h4>
                        <ShieldCheck className="w-3.5 h-3.5 text-sea-light flex-shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-300 truncate">{doc.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Online
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{doc.experience}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Smart Context Notice */}
        <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-white/10 text-xs space-y-1.5 mt-4">
          <div className="flex items-center gap-1.5 font-bold text-sea-light">
            <Sparkles className="w-3.5 h-3.5 text-sea-light" />
            <span>Smart Health Context Handoff</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Your message auto-attaches <strong className="text-slate-200">{activeMember?.name || 'Active Profile'}'s</strong> active medicines, recent scans & safety score for faster clinical review.
          </p>
        </div>
      </div>

      {/* Right Side: Telehealth Chat Interface */}
      <div className="flex-1 flex flex-col justify-between bg-slate-50/40">
        
        {/* Chat Header with Doctor Context Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sea-green to-teal-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-sea-green/20 overflow-hidden">
                {selectedDoctor.photo ? (
                  <img src={selectedDoctor.photo} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                ) : (
                  selectedDoctor.avatarText
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm sm:text-base text-slate-900">{selectedDoctor.name}</h3>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{selectedDoctor.title} • {selectedDoctor.hospital}</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70 text-xs font-bold text-slate-700">
              <Activity className="w-3.5 h-3.5 text-sea-green" />
              <span>Patient: {activeMember?.name || 'Self'}</span>
            </div>
          </div>

          {selectedDoctor.qualification && (
            <p className="mt-2 text-[11px] text-slate-500 font-medium">{selectedDoctor.qualification}</p>
          )}
          {selectedDoctor.intro && (
            <p className="mt-1 text-[11px] text-slate-400 leading-snug max-w-2xl">{selectedDoctor.intro}</p>
          )}
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-16 h-16 bg-teal-50 text-sea-green rounded-2xl flex items-center justify-center mb-4 border border-teal-100 shadow-2xs">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h4 className="font-black text-sm text-slate-800">Start a Consultation with {selectedDoctor.name}</h4>
              <p className="text-xs max-w-sm mt-1 text-slate-500">
                Describe your symptoms, ask about medicine safety, or request clinical guidance. Your health context will be auto-attached.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {/* Patient Sent Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[75%] space-y-1.5">
                    <div className="bg-gradient-to-r from-med-dark via-slate-900 to-med-navy text-white p-4 sm:p-5 rounded-3xl rounded-tr-md shadow-lg border border-white/10 space-y-2.5">
                      {/* Urgency Badge */}
                      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/15 text-[10px] uppercase font-extrabold tracking-wider">
                        <span className={`px-2.5 py-0.5 rounded-lg ${
                          msg.urgencyTag === 'urgent' ? 'bg-red-500 text-white' : msg.urgencyTag === 'concerning' ? 'bg-amber-400 text-slate-950' : 'bg-white/15 text-slate-200'
                        }`}>
                          Priority: {msg.urgencyTag || 'Routine'}
                        </span>
                        <span className="text-slate-300">{msg.createdAt || 'Just now'}</span>
                      </div>

                      <p className="text-xs sm:text-sm leading-relaxed">{msg.message}</p>

                      {/* Context Snapshot Card */}
                      {msg.contextSnapshot && (
                        <div className="mt-2 p-3 bg-sea-green/15 rounded-2xl text-[11px] text-teal-100 space-y-1 border border-sea-green/30">
                          <span className="font-extrabold block text-white flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-sea-light" /> Auto-Attached Health Snapshot:
                          </span>
                          <span>Active Meds: {Array.isArray(msg.contextSnapshot.activeMedicines) && msg.contextSnapshot.activeMedicines.length > 0 ? msg.contextSnapshot.activeMedicines.join(', ') : 'No active medicines recorded'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pr-2">
                      <MessageStatusTracker status={msg.status} doctorName={selectedDoctor.name} />
                    </div>
                  </div>
                </div>

                {/* Doctor Reply Bubble */}
                {msg.reply && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                      <div className="bg-white border border-slate-200/80 text-slate-800 p-4 sm:p-5 rounded-3xl rounded-tl-md shadow-subtle space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sea-green to-teal-700 text-white flex items-center justify-center text-[10px] font-black overflow-hidden">
                              {selectedDoctor.photo ? (
                                <img src={selectedDoctor.photo} alt={selectedDoctor.name} className="w-full h-full object-cover" />
                              ) : (
                                selectedDoctor.avatarText
                              )}
                            </div>
                            <span>{selectedDoctor.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">{msg.repliedAt || 'Replied'}</span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {msg.reply}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Message Composer Area */}
        <div className="p-4 bg-white border-t border-slate-200/70 shadow-2xs">
          <MessageComposer 
            doctorId={selectedDoctor.id} 
            doctorName={selectedDoctor.name}
            initialSymptom={location.state?.prefillSymptom}
            onMessageSent={handleMessageSent} 
          />
        </div>
      </div>
    </div>
  );
}
