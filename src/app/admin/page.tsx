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
  Eye
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPengajar: 0,
    totalModul: 0,
    totalHasilSiswa: 0,
    rataRataNilai: 0,
  });
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

      // 3. Hasil siswa
      const { data: results } = await supabase.from('student_results').select('nilai');
      const totalHasil = results?.length || 0;
      const avgNilai = totalHasil > 0 ? (results!.reduce((acc, r) => acc + Number(r.nilai), 0) / totalHasil).toFixed(1) : '0';

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
        .limit(15);

      setStats({
        totalPengajar: approvedPengajar,
        totalModul: totalModul || 0,
        totalHasilSiswa: totalHasil,
        rataRataNilai: Number(avgNilai),
      });

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
          <span className="p-1.5 rounded-lg bg-indigo-600 text-white font-bold">INFO</span>
          <span>
            Sebagai <b>Admin</b>, Anda dapat memantau seluruh statistik dan mengunduh hasil data, namun tidak memiliki wewenang untuk menyetujui/menolak pengajar atau mengubah modul pengajar.
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
            <span className="text-xs font-semibold text-slate-400">Guru</span>
          </div>
          <Link href="/admin/pengajar" className="mt-2 text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:underline">
            Lihat daftar pengajar &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Modul Latihan</span>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalModul}</span>
            <span className="text-xs font-semibold text-slate-400">Modul Aktif</span>
          </div>
          <span className="inline-block mt-2 text-xs font-medium text-slate-500">TKA SD Semua Mapel</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pengerjaan Siswa</span>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalHasilSiswa}</span>
            <span className="text-xs font-semibold text-slate-400">Siswa Telah Ujian</span>
          </div>
          <Link href="/admin/hasil" className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1 hover:underline">
            Lihat & Download Nilai &rarr;
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rata-Rata Nilai</span>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.rataRataNilai}</span>
            <span className="text-xs font-semibold text-slate-400">/ 100 poin</span>
          </div>
          <span className="inline-block mt-2 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            Skor Ujian Keseluruhan
          </span>
        </div>
      </div>

      {/* Logs Table (Read Only) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Monitoring Aktivitas Pengajar
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin memantau histori penginputan, pembaruan, dan penghapusan materi oleh para pengajar
            </p>
          </div>
          <button
            onClick={fetchAdminData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan Log</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Memuat aktivitas pengajar...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl">
            Belum ada log aktivitas dari pengajar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                  <th className="pb-3 px-4">Waktu</th>
                  <th className="pb-3 px-4">Pengajar</th>
                  <th className="pb-3 px-4">Aktivitas</th>
                  <th className="pb-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {logs.map((log) => {
                  const pengajar = log.pengajar_profiles;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 text-xs text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(log.created_at).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {pengajar?.username ? pengajar.username.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-xs">
                              {pengajar?.username ? `@${pengajar.username}` : 'Pengajar / System'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 max-w-md truncate">
                        {log.details || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
