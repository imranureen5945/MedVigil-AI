import React from 'react';
import { Calendar, Clock, Sun, Sunrise, Sunset, Moon, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SmartScheduleCard({ schedule }) {
  if (!schedule || !schedule.slots || schedule.slots.length === 0) return null;

  const getSlotIcon = (timeStr) => {
    const lower = timeStr.toLowerCase();
    if (lower.includes('morning') || lower.includes('6:00') || lower.includes('8:00')) {
      return { icon: Sunrise, color: 'text-amber-500 bg-amber-50 border-amber-200' };
    }
    if (lower.includes('afternoon') || lower.includes('noon') || lower.includes('2:00')) {
      return { icon: Sun, color: 'text-orange-500 bg-orange-50 border-orange-200' };
    }
    if (lower.includes('evening') || lower.includes('6:00 pm')) {
      return { icon: Sunset, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' };
    }
    return { icon: Moon, color: 'text-purple-500 bg-purple-50 border-purple-200' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-subtle space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black shadow-md">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
              4. Smart Medication Schedule
            </span>
            <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight">
              Daily Intake Timetable
            </h3>
          </div>
        </div>

        {schedule.durationText && (
          <span className="text-xs font-black px-3.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300">
            {schedule.durationText}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {schedule.slots.map((slot, index) => {
          const style = getSlotIcon(slot.time);
          const Icon = style.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 hover:bg-white transition-all shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${style.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="font-black text-xs text-slate-900">{slot.time}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-100 space-y-0.5">
                <span className="font-black text-sm text-sea-green block">
                  {slot.dose || '1 Tablet'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium block">
                  {slot.instruction || 'Take with water'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
