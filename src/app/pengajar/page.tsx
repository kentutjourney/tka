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
  Sparkles 
} from 'lucide-react';
import Link from 'next/link';

export default function PengajarDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myModules, setMyModules] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalModulSaya: 0,
    totalSoalSaya: 0,
    modulApproved: 0,
    totalSiswaUjian: 0,
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

      // 2. Fetch siswa yang mengerjakan modul milik pengajar ini
      const modIds = modList.map((m) => m.id);
      let totalSiswa = 0;
      if (modIds.length > 0) {
        const { count } = await supabase
          .from('student_results')
          .select('*', { count: 'exact', head: true })
          .in('module_id', modIds);
        totalSiswa = count || 0;
      }

      setStats({
        totalModulSaya: modList.length,
        totalSoalSaya: totalSoal,
        modulApproved: approvedMod,
        totalSiswaUjian: totalSiswa,
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
            Buat materi modul, tambahkan soal teks & bergambar dengan pilihan ganda A-B-C-D, dan ajukan modul Anda untuk try out TKA SD.
          </p>
        </div>

        <Link
          href="/pengajar/modul"
          className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 transition shadow-lg shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-emerald-600" />
          <span>Buat Modul & Soal Baru</span>
        </Link>
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
          <span className="inline-block mt-2 text-xs font-medium text-slate-500">Pilihan Ganda A-B-C-D</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Modul Disetujui</span>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">{stats.modulApproved}</span>
            <span className="text-xs font-semibold text-slate-400">Siap Ujian</span>
          </div>
          <span className="inline-block mt-2 text-xs font-medium text-slate-500">Try Out TKA SD</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Siswa Mengerjakan</span>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalSiswaUjian}</span>
            <span className="text-xs font-semibold text-slate-400">Peserta</span>
          </div>
          <Link href="/pengajar/hasil" className="mt-2 text-xs font-semibold text-amber-700 flex items-center gap-1 hover:underline">
            Lihat hasil & statistik &rarr;
          </Link>
        </div>
      </div>

      {/* Quick Access My Modules */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Modul Terbaru Saya</h3>
            <p className="text-xs text-slate-500 mt-0.5">Daftar modul yang Anda kelola</p>
          </div>
          <Link
            href="/pengajar/modul"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Lihat Semua Modul <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Memuat data modul...</div>
        ) : myModules.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl p-6">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">Belum Ada Modul yang Dibuat</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
              Mulai buat modul pertama Anda dengan memilih mata pelajaran, kelas, dan memasukkan bank soal.
            </p>
            <Link
              href="/pengajar/modul"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Buat Modul Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myModules.slice(0, 3).map((mod) => (
              <div
                key={mod.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {mod.mata_pelajaran}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{mod.kelas}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{mod.nama_modul}</h4>
                  <p className="text-xs text-slate-400">
                    {mod.questions?.[0]?.count || 0} Pertanyaan terdaftar
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {new Date(mod.created_at).toLocaleDateString('id-ID')}
                  </span>
                  <Link
                    href={`/pengajar/modul/${mod.id}`}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    Kelola Soal &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
