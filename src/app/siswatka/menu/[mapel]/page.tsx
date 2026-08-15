'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, PlayCircle, Loader2, AlertCircle } from 'lucide-react';

export default function SiswaModulesPage({ params }: { params: Promise<{ mapel: string }> }) {
  const resolvedParams = use(params);
  const mapelName = decodeURIComponent(resolvedParams.mapel);
  const router = useRouter();
  
  const [siswa, setSiswa] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionData = sessionStorage.getItem('tka_siswa');
    if (!sessionData) {
      router.push('/siswatka');
      return;
    }
    setSiswa(JSON.parse(sessionData));
    fetchModules();
  }, [router, mapelName]);

  const fetchModules = async () => {
    try {
      const res = await fetch(`/api/siswatka/modules?mapel=${encodeURIComponent(mapelName)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal memuat modul.');
      
      setModules(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!siswa) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/siswatka/menu"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-slate-600 hover:text-indigo-600 font-bold text-sm shadow-sm border border-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu Utama</span>
          </Link>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500">Mata Pelajaran</p>
            <h2 className="text-xl font-black text-indigo-700">{mapelName}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            <h3 className="text-lg font-black text-slate-800">Daftar Modul Try Out</h3>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
              <p className="text-slate-500 font-medium text-sm">Sedang memuat modul latihan...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-slate-600 font-bold">Belum Ada Modul Tersedia</h4>
              <p className="text-slate-400 text-sm mt-1">Belum ada modul yang disetujui untuk mata pelajaran ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((mod) => (
                <div key={mod.id} className="group border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
                        {mod.kelas}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Oleh @{mod.pengajar_profiles?.username}
                      </span>
                    </div>
                    <h4 className="font-black text-lg text-slate-800 mb-1 leading-tight group-hover:text-indigo-600 transition">
                      {mod.nama_modul}
                    </h4>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{mod.total_soal} Soal</span>
                      </div>
                      {/* Optional: if we want to show total duration, we could aggregate it, but for now we don't have it easily. Let's just show a general clock icon */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Bervariasi</span>
                      </div>
                    </div>
                  </div>

                  <Link 
                    href={`/siswatka/ujian/${mod.id}`}
                    className="mt-6 w-full py-3 bg-indigo-50 text-indigo-600 font-black text-sm rounded-xl flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Mulai Kerjakan</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
