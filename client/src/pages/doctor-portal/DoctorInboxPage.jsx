import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Stethoscope, 
  LogOut, 
  ShieldCheck, 
  Inbox, 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  User,
  Filter
} from 'lucide-react';
import PatientMessageCard from './components/PatientMessageCard';
import { useAuth } from '../../context/AuthContext';
import { doctorConnectService } from '../../services/doctorConnectService';

export default function DoctorInboxPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const doctorName = user?.name || 'Doctor';
  const doctorSpec = user?.specialization || 'Clinical Portal';

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const data = await doctorConnectService.getDoctorInbox();
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  const handleReplySubmit = async (messageId, replyText, isVerified) => {
    try {
      await doctorConnectService.replyMessage(messageId, {
        reply: replyText,
        isVerified: isVerified ? 1 : 0
      });
    } catch (e) {
      console.warn('Backend sync failed, updating UI state:', e);
    }

    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        return {
          ...m,
          reply: replyText,
          isVerified: isVerified ? 1 : 0,
          status: 'replied'
        };
      }
      return m;
    }));
  };

  // Sort: Urgent first, then Concerning, then Routine
  const sortedMessages = [...messages].sort((a, b) => {
    const priorityOrder = { urgent: 0, concerning: 1, routine: 2 };
    return (priorityOrder[a.urgencyTag] ?? 2) - (priorityOrder[b.urgencyTag] ?? 2);
  });

  const filteredMessages = sortedMessages.filter(m => {
    if (filter === 'urgent') return m.urgencyTag === 'urgent';
    if (filter === 'pending') return !m.reply;
    if (filter === 'replied') return !!m.reply;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Clinical Header (Restricted Doctor View) */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-md">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-white">
                  MedVigil AI Clinical Portal
                </h1>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  Doctor Access
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as: <strong className="text-slate-200">{doctorName}</strong> ({doctorSpec})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchInbox}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh Inbox"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-bold text-xs transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Inbox Body */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Pending Inquiries</span>
            <span className="text-3xl font-black text-white mt-1 block">
              {messages.filter(m => !m.reply).length}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-red-500/30 rounded-3xl p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 block">Urgent Priority Flags</span>
            <span className="text-3xl font-black text-red-400 mt-1 block">
              {messages.filter(m => m.urgencyTag === 'urgent' && !m.reply).length}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-emerald-500/30 rounded-3xl p-5 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">Verified Replies Given</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              {messages.filter(m => m.isVerified === 1).length}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 pl-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All Messages' },
              { id: 'urgent', label: '🚨 Urgent Only' },
              { id: 'pending', label: '⏳ Awaiting Reply' },
              { id: 'replied', label: '✅ Replied' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filter === f.id ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium pr-2">
            Showing {filteredMessages.length} patient consultations
          </span>
        </div>

        {/* Patient Message Cards Stream */}
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/40 rounded-3xl border border-slate-800 text-slate-400 space-y-2">
              <Inbox className="w-12 h-12 mx-auto text-slate-600" />
              <h3 className="font-bold text-base text-slate-300">No Patient Consultations</h3>
              <p className="text-xs text-slate-500">Patient inquiries will appear here once submitted through the platform.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <PatientMessageCard 
                key={msg.id} 
                message={msg} 
                onReplySubmit={handleReplySubmit}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
