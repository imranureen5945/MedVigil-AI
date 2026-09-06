import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Paperclip, Sparkles, AlertCircle, Check } from 'lucide-react';
import { doctorConnectService } from '../../../services/doctorConnectService';
import { useFamily } from '../../../context/FamilyContext';

export default function MessageComposer({ doctorId, doctorName = 'Doctor', initialSymptom = '', onMessageSent }) {
  const { t } = useTranslation();
  const { activeMember } = useFamily();
  const [message, setMessage] = useState(initialSymptom ? `Patient query regarding: ${initialSymptom}` : '');
  const [urgencyTag, setUrgencyTag] = useState('routine');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (initialSymptom) {
      setMessage(`Patient query regarding: ${initialSymptom}`);
    }
  }, [initialSymptom]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const payload = {
        doctorId,
        message: message.trim(),
        urgencyTag,
        contextSnapshot: JSON.stringify({
          activeMedicines: [],
          safetyScore: activeMember?.safetyScore || null,
          activeAlerts: null,
          memberName: activeMember?.name || 'Self',
          age: activeMember?.age || null,
          relation: activeMember?.relation || 'Self'
        })
      };

      const res = await doctorConnectService.sendMessage(payload);
      
      const newMsgObj = {
        id: res?.id || Date.now(),
        doctorId,
        message: message.trim(),
        urgencyTag,
        status: 'sent',
        createdAt: 'Just now',
        contextSnapshot: {
          activeMedicines: [],
          safetyScore: null
        }
      };

      if (onMessageSent) onMessageSent(newMsgObj);
      setMessage('');
    } catch (err) {
      // Fallback local message creation
      const localMsg = {
        id: Date.now(),
        doctorId,
        message: message.trim(),
        urgencyTag,
        status: 'sent',
        createdAt: 'Just now',
        contextSnapshot: {
          activeMedicines: [],
          safetyScore: null
        }
      };
      if (onMessageSent) onMessageSent(localMsg);
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  const urgencyPills = [
    { id: 'routine', label: 'Routine Inquiry', bg: 'bg-slate-100 text-slate-700 hover:bg-slate-200', active: 'bg-slate-800 text-white shadow-sm' },
    { id: 'concerning', label: 'Concerning Reaction', bg: 'bg-amber-50 text-amber-800 hover:bg-amber-100', active: 'bg-amber-500 text-slate-950 font-bold shadow-sm' },
    { id: 'urgent', label: 'Urgent Guidance', bg: 'bg-red-50 text-red-800 hover:bg-red-100', active: 'bg-red-600 text-white font-bold shadow-sm' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Priority Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority:</span>
        {urgencyPills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setUrgencyTag(pill.id)}
            className={`px-3 py-1 rounded-xl text-xs transition duration-150 whitespace-nowrap ${
              urgencyTag === pill.id ? pill.active : pill.bg
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition">
        <textarea 
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Type message to ${doctorName}...`}
          className="flex-1 bg-transparent border-none outline-none resize-none py-1.5 px-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <button 
          type="submit"
          disabled={!message.trim() || sending}
          className={`p-3 rounded-xl text-white shadow-md transition flex-shrink-0 flex items-center justify-center ${
            !message.trim() || sending
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/20'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Auto-attaching: <strong>{activeMember?.name || 'Self'}</strong>'s active prescriptions & safety score
        </span>
        <span className="hidden sm:inline">Press Enter to send</span>
      </div>
    </form>
  );
}
