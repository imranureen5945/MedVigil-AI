import React, { useState } from 'react';
import { Send, ShieldCheck, CheckSquare, Square } from 'lucide-react';

export default function ReplyBox({ messageId, onSendReply }) {
  const [replyText, setReplyText] = useState('');
  const [isVerified, setIsVerified] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;

    setSubmitting(true);
    if (onSendReply) {
      onSendReply(replyText.trim(), isVerified);
    }
    setReplyText('');
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Clinical Guidance / Verified Prescription Advice
        </label>
        <textarea 
          rows={3} 
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Provide clear medicine recommendations, dosage adjustments, or instructions to visit the clinic..."
          className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl focus:bg-slate-750 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-xs sm:text-sm text-slate-100 placeholder-slate-500 resize-none transition"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <label 
          onClick={() => setIsVerified(!isVerified)}
          className="inline-flex items-center gap-2.5 text-xs text-slate-300 font-semibold cursor-pointer select-none bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700"
        >
          <input 
            type="checkbox" 
            checked={isVerified}
            onChange={() => {}} 
            className="hidden"
          />
          {isVerified ? (
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          ) : (
            <Square className="w-4 h-4 text-slate-500" />
          )}
          <span className="flex items-center gap-1">
            Attach <strong className="text-emerald-400">✅ Doctor Verified Badge</strong> to recommendations
          </span>
        </label>

        <button 
          type="submit"
          disabled={!replyText.trim() || submitting}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition flex items-center justify-center gap-2 ${
            !replyText.trim() || submitting
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-blue-600/30'
          }`}
        >
          <span>Send Clinical Reply</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
