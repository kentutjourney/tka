'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BookOpen, 
  PlusCircle, 
  HelpCircle, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  Sparkles,
  Trophy,
  RefreshCw,
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function PengajarDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myModules, setMyModules] = useState<any[]>([]);
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalModulSaya: 0,
    totalSoalSaya: 0,
    modulApproved: 0,
    totalSiswaUjian: 0,
    rataRataNilai: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('tka_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        fetchPengajarData(user.id);
      } catch (e) {}
    }
  }, []);

  const fetchPengajarData = async (pengajarId: string) => {
    try {
      setLoading(true);

      // 1. Fetch modul milik pengajar ini
      let query = supabase.from('modules').select(`
        *,
        questions (count)
      `).order('created_at', { ascending: false });

      if (pengajarId) {
        query = query.eq('pengajar_id', pengajarId);
      }

      const { data: modules, error } = await query;
      if (error) throw error;

      const modList = modules || [];
      setMyModules(modList);

      const totalSoal = modList.reduce((acc, m) => acc + (m.questions?.[0]?.count || 0), 0);
      const approvedMod = modList.filter((m) => m.status_approval === 'approved').length;

      // 2. Fetch siswa yang mengerjakan ujian dari tabel exam_results
      const { data: examData } = await supabase
        .from('exam_results')
        .select('*')
        .order('created_at', { ascending: false });

      const totalSiswaUjian = examData?.length || 0;
      const scores = examData?.map((e) => Number(e.skor) || 0) || [];
      const avgNilai = totalSiswaUjian > 0 ? (scores.reduce((a, b) => a + b, 0) / totalSiswaUjian).toFixed(1) : '0';

      setRecentExams(examData?.slice(0, 5) || []);

      setStats({
        totalModulSaya: modList.length,
        totalSoalSaya: totalSoal,
        modulApproved: approvedMod,
        totalSiswaUjian,
        rataRataNilai: Number(avgNilai),
      });
    } catch (err) {
      console.error('Error fetching pengajar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-800 rounded-3xl p-8 text-white shadow-xl shadow-emerald-900/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Guru Pengajar Terverifikasi</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            Selamat Datang, {currentUser?.username ? `@${currentUser.username}` : 'Bapak/Ibu Guru'}!
          </h2>
          <p className="text-emerald-100/90 text-sm max-w-xl">
            Buat materi modul, susun bank soal teks & bergambar (A s/d H), pantau pengajuan ACC modul, serta evaluasi hasil nilai try out siswa secara real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/pengajar/hasil"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-emerald-500/30 border border-emerald-300/40 text-white font-bold text-sm hover:bg-emerald-500/40 transition"
          >
            <BarChart3 className="w-5 h-5 text-emerald-200" />
            <span>Lihat Nilai Siswa</span>
          </Link>

          <Link
            href="/pengajar/modul"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white text-emerald-950 font-bold text-sm hover:bg-emerald-50 transition shadow-lg"
          >
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            <span>+ Buat Modul Baru</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Modul Saya</span>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalModulSaya}</span>
            <span className="text-xs font-semibold text-slate-400">Modul dibuat</span>
          </div>
          <Link href="/pengajar/modul" className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:underline">
            Kelola modul saya &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Soal Dibuat</span>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalSoalSaya}</span>
            <span className="text-xs font-semibold text-slate-400">Pertanyaan</span>
          </div>
          <span className="inline-block mt-2 text-xs font-medium text-slate-500">Opsi Dinamis & Durasi Detik</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ujian Siswa Selesai</span>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalSiswaUjian}</span>
            <span className="text-xs font-semibold text-slate-400">Sesi Ujian</span>
          </div>
          <Link href="/pengajar/hasil" className="mt-2 text-xs font-semibold text-amber-700 flex items-center gap-1 hover:underline">
            Lihat hasil nilai &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rata-Rata Skor</span>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-700">{stats.rataRataNilai}</span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
          <span className="inline-block mt-2 text-xs font-medium text-slate-500">Hasil Evaluasi Siswa</span>
        </div>
      </div>

      {/* Grid: My Modules & Recent Student Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Student Scores */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Hasil Nilai Siswa Terbaru
                </h3>
                <p className="text-xs text-slate-500">Siswa yang baru menyelesaikan latihan modul</p>
              </div>
              <Link href="/pengajar/hasil" className="text-xs font-bold text-emerald-600 hover:underline">
                Lihat Rekap Lengkap &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Memuat data nilai...</div>
            ) : recentExams.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Belum ada siswa yang menyelesaikan latihan try out.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentExams.map((exam) => {
                  const score = Number(exam.skor);
                  const isHigh = score >= 80;
                  const isMed = score >= 65 && score < 80;

                  return (
                    <div key={exam.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                          {exam.nama_lengkap?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase">{exam.nama_lengkap}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {exam.nama_modul} &bull; <b className="text-slate-600">{exam.mata_pelajaran}</b>
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                          isHigh
                            ? 'bg-emerald-100 text-emerald-800'
                            : isMed
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {score}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            href="/pengajar/hasil"
            className="mt-4 w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl text-center transition block"
          >
            Buka Rekapitulasi & Download Excel (.xlsx)
          </Link>
        </div>

        {/* My Recent Modules */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Modul Terbaru Anda
                </h3>
                <p className="text-xs text-slate-500">Status persetujuan & bank soal modul</p>
              </div>
              <Link href="/pengajar/modul" className="text-xs font-bold text-indigo-600 hover:underline">
                Kelola Semua &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Memuat data modul...</div>
            ) : myModules.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200 text-xs text-slate-500">
                Belum ada modul yang dibuat.
              </div>
            ) : (
              <div className="space-y-2.5">
                {myModules.slice(0, 5).map((mod) => (
                  <div
                    key={mod.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                          {mod.mata_pelajaran}
                        </span>
                        {mod.status_approval === 'approved' ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Disetujui
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            ⏳ Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-1">{mod.nama_modul}</p>
                    </div>

                    <Link
                      href={`/pengajar/modul/${mod.id}`}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
                    >
                      Kelola Soal
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/pengajar/modul"
            className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center transition block"
          >
            Buat Modul & Soal Baru
          </Link>
        </div>

      </div>
    </div>
  );
}
