'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  roleBadge?: string;
}

export default function Header({ title, subtitle, roleBadge }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-10 border-b border-slate-200/60 px-6 py-4 flex items-center justify-between shadow-sm shadow-slate-900/5">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-black text-slate-900 tracking-tight">{title}</h1>
          {roleBadge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wider">
              {roleBadge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Sparkles className="w-3 h-3" />
          <span>Server Active</span>
        </div>
      </div>
    </header>
  );
}
