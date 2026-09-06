import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function DoctorVerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-100">
      <CheckCircle2 size={12} className="text-teal-600" />
      Doctor Verified
    </span>
  );
}
