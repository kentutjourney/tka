'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Calculator, Globe, LogOut, Sparkles } from 'lucide-react';

export default function SiswaMenuPage() {
  const router = useRouter();
  const [siswa, setSiswa] = useState<any>(null);

  useEffect(() => {
    // Cek apakah siswa sudah login
    const sessionData = sessionStorage.getItem('tka_siswa');
    if (!sessionData) {
      router.push('/siswatka');
      return;
    }
    setSiswa(JSON.parse(sessionData));
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('tka_siswa');
    router.push('/siswatka');
  };

  const mapelList = [
    { name: 'Matematika', icon: Calculator, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/30' },
    { name: 'Bahasa Indonesia', icon: BookOpen, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/30' },
    { name: 'IPAS', icon: Globe, color: 'from-amber-500 to-yellow-400', shadow: 'shadow-amber-500/30' },
  ];

  if (!siswa) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-2xl shadow-lg">
              {siswa.nama_lengkap.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Selamat Datang, Peserta TKA!
              </p>
              <h1 className="text-2xl font-black text-slate-900 uppercase">{siswa.nama_lengkap}</h1>
              <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-1">
                NISN: {siswa.nisn}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-sm transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>

        {/* Menu Section */}
        <div className="space-y-4">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-black text-slate-800">Pilih Mata Ujian</h2>
            <p className="text-slate-500 text-sm font-medium">Silakan pilih mata pelajaran untuk mulai mengerjakan simulasi TKA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mapelList.map((mapel) => {
              const Icon = mapel.icon;
              return (
                <Link
                  href={`/siswatka/menu/${encodeURIComponent(mapel.name)}`}
                  key={mapel.name}
                  className="block group"
                >
                  <div className={`bg-gradient-to-br ${mapel.color} rounded-3xl p-6 shadow-xl ${mapel.shadow} text-white transform transition duration-300 hover:scale-105 hover:-translate-y-1 relative overflow-hidden h-full flex flex-col`}>
                    {/* Decorative Background */}
                    <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:scale-110 transition duration-500">
                      <Icon className="w-32 h-32" />
                    </div>
                    
                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight mb-4 drop-shadow-sm flex-1">{mapel.name}</h3>
                      <div className="inline-flex items-center gap-2 text-sm font-bold bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl mt-auto w-fit">
                        <span>Masuk Modul</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

// Icon helper
function ArrowRightIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
