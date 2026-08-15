'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import Header from '@/components/navigation/Header';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('tka_user');
    if (!savedUser) {
      router.push('/loginadmin');
      return;
    }

    try {
      const parsed = JSON.parse(savedUser);
      if (parsed.role !== 'superadmin') {
        router.push('/loginadmin');
        return;
      }
      setCurrentUser(parsed);
    } catch (e) {
      router.push('/loginadmin');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-sm">Memuat Sesi Super Admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        role="superadmin" 
        userName={currentUser?.username} 
        userEmail={currentUser?.email} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title="Super Admin Control Panel" 
          subtitle="Akses penuh konfigurasi, log guru pengajar, & persetujuan akun"
          roleBadge="SUPER ADMIN"
        />
        <main className="p-8 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
