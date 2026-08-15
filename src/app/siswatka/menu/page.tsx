'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Calculator, Globe, LogOut, Sparkles, Trophy, History, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SiswaMenuPage() {
  const router = useRouter();
  const [siswa, setSiswa] = useState<any>(null);
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);

  useEffect(() => {
    // Cek apakah siswa sudah login
    const sessionData = sessionStorage.getItem('tka_siswa');
    if (!sessionData) {
      router.push('/siswatka');
      return;
    }
    const studentInfo = JSON.parse(sessionData);
    setSiswa(studentInfo);
    fetchRecentHistory(studentInfo.id, studentInfo.nisn);
  }, [router]);

  const fetchRecentHistory = async (studentId: string, nisn: string) => {
    try {
      setLoadingExams(true);
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .or(`student_id.eq.${studentId},nisn.eq.${nisn}`)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentExams(data || []);
    } catch (err) {
      console.error('Error fetching recent exams:', err);
    } finally {
      setLoadingExams(false);
    }
  };

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

          <div className="flex items-center gap-2">
            <Link
              href="/siswatka/riwayat"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition"
            >
              <Trophy className="w-4 h-4 text-indigo-600" />
              <span>Riwayat Nilai Saya</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
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
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Exams Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Ujian yang Baru Saja Kamu Selesaikan
            </h3>
            <Link href="/siswatka/riwayat" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              Lihat Semua Nilai &rarr;
            </Link>
          </div>

          {loadingExams ? (
            <div className="py-8 text-center text-xs text-slate-400">Memuat riwayat...</div>
          ) : recentExams.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-500">Belum ada riwayat ujian.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Pilih salah satu mata pelajaran di atas untuk mulai latihan soal!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentExams.map((exam) => {
                const score = Number(exam.skor) || 0;
                return (
                  <div
                    key={exam.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        {exam.mata_pelajaran}
                      </span>
                      <p className="text-xs font-black text-slate-800 mt-1 truncate max-w-[160px]">{exam.nama_modul}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(exam.waktu_selesai || exam.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-indigo-700">{score}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Skor Nilai</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
