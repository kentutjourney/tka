import React from 'react';

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      {children}
    </div>
  );
}
