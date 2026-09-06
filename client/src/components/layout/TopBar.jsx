import React from 'react';
import { Menu } from 'lucide-react';

export default function TopBar({ onMenuClick }) {
  return (
    <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 flex items-center px-4 sm:px-8 z-20 sticky top-0 shadow-subtle">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition"
        aria-label="Toggle Navigation"
      >
        <Menu size={22} />
      </button>
    </header>
  );
}
