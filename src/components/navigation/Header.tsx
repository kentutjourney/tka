'use client';

import React from 'react';
import { Sparkles, Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  roleBadge?: string;
}

export default function Header({ title, subtitle, roleBadge }: HeaderProps) {
  return (
    <header
      style={{ background: 'rgba(255,255,255,0.85)' }}
      className="backdrop-blur-2xl sticky top-0 z-20 border-b border-slate-200/50 px-7 py-3.5 flex items-center justify-between shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_4px_24px_-4px_rgba(0,0,0,0.06)]"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[15px] font-black text-slate-900 tracking-tight">{title}</h1>
          {roleBadge && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              {roleBadge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <Sparkles className="w-3 h-3" />
          <span>Supabase Connected</span>
        </div>
      </div>
    </header>
  );
}
