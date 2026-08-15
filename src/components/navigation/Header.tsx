'use client';

import React from 'react';
import { Bell, Sparkles } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  roleBadge?: string;
}

export default function Header({ title, subtitle, roleBadge }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200/80 px-8 py-5 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          {title}
          {roleBadge && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {roleBadge}
            </span>
          )}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Server Active (Supabase Connected)</span>
        </div>
      </div>
    </header>
  );
}
