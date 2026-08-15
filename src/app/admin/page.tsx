'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  BookOpen, 
  History, 
  Clock, 
  RefreshCw, 
  GraduationCap, 
  Award,
  Eye,
  BarChart3,
  Trophy
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPengajar: 0,
    totalModul: 0,
    totalHasilSiswa: 0,
    rataRataNilai: 0,
  });
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      // 1. Total pengajar
      const { data: pengajars } = await supabase.from('pengajar_profiles').select('id, status');
      const approvedPengajar = pengajars?.filter((p) => p.status === 'approved').length || 0;

      // 2. Total modul
      const { count: totalModul } = await supabase.from('modules').select('*', { count: 'exact', head: true });

      // 3. Hasil siswa dari exam_results
      const { data: results } = await supabase
        .from('exam_results')
        .select('*')
        .order('created_at', { ascending: false });

      const totalHasil = results?.length || 0;
      const scores = results?.map(r => Number(r.skor) || 0) || [];
      const avgNilai = totalHasil > 0 ? (scores.reduce((acc, r) => acc + r, 0) / totalHasil).toFixed(1) : '0';

      // 4. Logs
      const { data: logData } = await supabase
        .from('activity_logs')
        .select(`
          id,
          action,
          details,
          created_at,
          pengajar_profiles (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalPengajar: approvedPengajar,
        totalModul: totalModul || 0,
        totalHasilSiswa: totalHasil,
        rataRataNilai: Number(avgNilai),
      });

      setRecentExams(results?.slice(0, 6) || []);
      setLogs(logData || []);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[10px]">ADMIN</span>
          <span>
            Sebagai <b>Admin</b>, Anda dapat memantau seluruh statistik pengerjaan soal dan mengunduh rekap nilai siswa (.xlsx).
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pengajar Aktif</span>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalPengajar}</span>
            <span className="text-xs font-semibold text-slate-400">Guru Terverifikasi</span>
          </div>
          <span className="inline-block mt-2 text-xs font-medium text-indigo-600">
            Dapat membuat materi & soal
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Modul</span>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalModul}</span>
            <span className="text-xs font-semibold text-slate-400">Paket Soal</span>
          </div>
          <span className="inline-block mt-2 text-xs font-medium text-emerald-600">
            Mata Pelajaran TKA SD
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ujian Siswa</span>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalHasilSiswa}</span>
            <span className="text-xs font-semibold text-slate-400">Selesai Dikerjakan</span>
          </div>
          <Link href="/admin/hasil" className="mt-2 text-xs font-semibold text-purple-600 flex items-center gap-1 hover:underline">
            Lihat rekap nilai &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rata-Rata Nilai</span>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.rataRataNilai}</span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
          <span className="inline-block mt-2 text-xs font-medium text-amber-600">
            Skor Keseluruhan
          </span>
        </div>
      </div>

      {/* Grid Recent Exams & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Hasil Ujian Siswa Terbaru
                </h3>
                <p className="text-xs text-slate-500">Daftar siswa yang baru menyelesaikan simulasi</p>
              </div>
              <Link href="/admin/hasil" className="text-xs font-bold text-indigo-600 hover:underline">
                Buka Semua &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Memuat data...</div>
            ) : recentExams.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">Belum ada data pengerjaan siswa.</div>
            ) : (
              <div className="space-y-2.5">
                {recentExams.map((exam) => {
                  const score = Number(exam.skor);
                  const isHigh = score >= 80;
                  const isMed = score >= 65 && score < 80;

                  return (
                    <div key={exam.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                          {exam.nama_lengkap?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase">{exam.nama_lengkap}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {exam.nama_modul} &bull; {exam.mata_pelajaran}
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
            href="/admin/hasil"
            className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl text-center transition block"
          >
            Download Rekap Excel Lengkap (.xlsx)
          </Link>
        </div>

        {/* Live Logs */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Live Log Aktivitas
              </h3>
              <p className="text-xs text-slate-500">Riwayat sistem & aktivitas guru</p>
            </div>
            <button
              onClick={fetchAdminData}
              disabled={refreshing}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Memuat log...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">Belum ada log aktivitas.</div>
          ) : (
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {log.action}
                    </span>
                    <span className="text-slate-400">
                      {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed mt-0.5">{log.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
