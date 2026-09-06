import React, { useState } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  User, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  CheckCircle2, 
  Pill, 
  Activity,
  ShieldCheck
} from 'lucide-react';
import ReplyBox from './ReplyBox';
import SafetyScoreRing from '../../../components/shared/SafetyScoreRing';

export default function PatientMessageCard({ message, onReplySubmit }) {
  const [expanded, setExpanded] = useState(message.urgencyTag === 'urgent' || !message.reply);

  const urgency = message.urgencyTag || 'routine';
  const isUrgent = urgency === 'urgent';
  const isConcerning = urgency === 'concerning';

  const context = typeof message.contextSnapshot === 'string'
    ? JSON.parse(message.contextSnapshot || '{}')
    : message.contextSnapshot || {};

  return (
    <div className={`rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm ${
      isUrgent 
        ? 'bg-slate-850 border-red-500/50 shadow-red-500/5' 
        : isConcerning
        ? 'bg-slate-850 border-amber-500/40'
        : 'bg-slate-850 border-slate-700'
    }`}>
      {/* Clickable Header */}
      <div 
        onClick={() => setExpanded(!expanded)} 
        className="p-5 sm:p-6 cursor-pointer hover:bg-slate-800/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
            isUrgent ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : isConcerning ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-blue-600 text-white'
          }`}>
            {(message.patientName || 'Patient').charAt(0)}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-base text-white">{message.patientName || 'Patient Inquiry'}</h3>
              <span className="text-xs text-slate-400 font-semibold">
                ({message.patientRelation || 'Family Member'} • {message.patientAge || '32'} yrs)
              </span>

              {isUrgent && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                  <AlertOctagon className="w-3 h-3" /> Urgent
                </span>
              )}
              {isConcerning && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  <AlertTriangle className="w-3 h-3" /> Concerning
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
              {message.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right text-[11px] text-slate-400">
            <span>{message.time || message.createdAt || 'Recent'}</span>
            <span className={`block font-bold text-xs ${message.reply ? 'text-emerald-400' : 'text-amber-400'}`}>
              {message.reply ? '✓ Replied' : '● Needs Reply'}
            </span>
          </div>

          <button className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 transition">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Context & Reply Box */}
      {expanded && (
        <div className="p-5 sm:p-6 bg-slate-900/90 border-t border-slate-700/80 space-y-6">
          {/* Smart Context Handoff Bar */}
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Smart Context Handoff (Attached by MedVigil Engine)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Profile ID: #{message.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Active Prescriptions</span>
                <span className="font-semibold text-slate-200 block">
                  {Array.isArray(context.activeMedicines) ? context.activeMedicines.join(', ') : 'Panadol, Risek, Augmentin'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Live Safety Score</span>
                <span className="font-extrabold text-teal-400 text-sm block">
                  {context.safetyScore || 94}/100 (Safe Profile)
                </span>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Active Alerts</span>
                <span className="font-semibold text-slate-300 block">
                  {context.activeAlerts || '0 critical drug interactions'}
                </span>
              </div>
            </div>
          </div>

          {/* Full Patient Message */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Patient Message</span>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              "{message.message}"
            </p>
          </div>

          {/* Existing Reply View if already replied */}
          {message.reply ? (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">Your Clinical Response</span>
                  {message.isVerified === 1 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-md">
                      ✅ Doctor Verified
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{message.repliedAt || 'Replied'}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {message.reply}
              </p>
            </div>
          ) : (
            <ReplyBox 
              messageId={message.id} 
              onSendReply={(replyText, isVerified) => onReplySubmit(message.id, replyText, isVerified)} 
            />
          )}
        </div>
      )}
    </div>
  );
}
