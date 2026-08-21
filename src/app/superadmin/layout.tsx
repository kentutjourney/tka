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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm font-medium">Memuat Sesi Super Admin...</span>
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          title="Super Admin Control Panel" 
          subtitle="Akses penuh konfigurasi, log guru pengajar, & persetujuan akun"
          roleBadge="SUPER ADMIN"
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
