'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import Header from '@/components/navigation/Header';

export default function PengajarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('tka_user');
    if (!savedUser) {
      router.push('/pengajar/login');
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      if (parsed.role !== 'pengajar') {
        // Jika admin/superadmin ingin masuk ke tampilan pengajar, bisa izinkan atau redirect
        if (parsed.role === 'superadmin' || parsed.role === 'admin') {
          setCurrentUser(parsed);
          setLoading(false);
          return;
        }
        router.push('/pengajar/login');
        return;
      }
      setCurrentUser(parsed);
    } catch (e) {
      router.push('/pengajar/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-sm">Memuat Sesi Guru Pengajar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        role="pengajar" 
        userName={currentUser?.username ? `@${currentUser.username}` : 'Guru Pengajar'} 
        userEmail={currentUser?.email} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Dashboard Guru & Pengajar" 
          subtitle="Pembuatan modul materi, penyusunan latihan soal, & evaluasi hasil siswa"
          roleBadge="PENGAJAR"
        />
        <main className="p-8 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
