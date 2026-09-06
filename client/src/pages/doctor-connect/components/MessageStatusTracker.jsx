import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';

export default function MessageStatusTracker({ status = 'sent', doctorName = 'Doctor' }) {
  const isSent = status === 'sent' || status === 'seen' || status === 'replied';
  const isSeen = status === 'seen' || status === 'replied';
  const isReplied = status === 'replied';

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200 text-[10px] font-semibold text-slate-500 shadow-2xs">
      <span className={`flex items-center gap-1 ${isSent ? 'text-teal-700 font-bold' : 'text-slate-400'}`}>
        <Check className="w-3 h-3" /> Sent
      </span>
      <span className="text-slate-300">→</span>
      <span className={`flex items-center gap-1 ${isSeen ? 'text-teal-700 font-bold' : 'text-slate-400'}`}>
        {isSeen ? <CheckCheck className="w-3 h-3 text-teal-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
        Seen by {doctorName.split(' ')[1] || 'Doctor'}
      </span>
      <span className="text-slate-300">→</span>
      <span className={`flex items-center gap-1 ${isReplied ? 'text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded' : 'text-slate-400'}`}>
        {isReplied ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
        Replied
      </span>
    </div>
  );
}
