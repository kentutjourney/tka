'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  BookOpen, 
  HelpCircle, 
  History, 
  Clock, 
  RefreshCw, 
  User, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPengajar: 0,
    pendingPengajar: 0,
    totalModul: 0,
    totalSoal: 0,
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      // 1. Fetch pengajar stats
      const { data: pengajars } = await supabase.from('pengajar_profiles').select('id, status');
      const totalPengajar = pengajars?.length || 0;
      const pendingPengajar = pengajars?.filter(p => p.status === 'pending').length || 0;

      // 2. Fetch module stats
      const { count: totalModul } = await supabase.from('modules').select('*', { count: 'exact', head: true });

      // 3. Fetch questions stats
      const { count: totalSoal } = await supabase.from('questions').select('*', { count: 'exact', head: true });

      // 4. Fetch activity logs
      const { data: logData } = await supabase
        .from('activity_logs')
        .select(`
          id,
          action,
          details,
          created_at,
          user_id,
          pengajar_profiles (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(15);

      setStats({
        totalPengajar,
        pendingPengajar,
        totalModul: totalModul || 0,
        totalSoal: totalSoal || 0,
      });

      setLogs(logData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner Pending Approval Alert */}
      {stats.pendingPengajar > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                Ada {stats.pendingPengajar} Pendaftaran Pengajar Baru Menunggu Approval!
              </h4>
              <p className="text-xs text-amber-700">
                Pengajar tidak dapat login sebelum Anda menyetujui akun mereka.
              </p>
            </div>
          </div>
          <Link
            href="/superadmin/pengajar"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            Tinjau Sekarang &rarr;
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pengajar</span>
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalPengajar}</span>
            <span className="text-xs font-semibold text-slate-400">Akun Terdaftar</span>
          </div>
          {stats.pendingPengajar > 0 && (
            <span className="inline-block mt-2 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {stats.pendingPengajar} menunggu ACC
            </span>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Modul</span>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalModul}</span>
            <span className="text-xs font-semibold text-slate-400">Modul TKA SD</span>
          </div>
          <Link href="/superadmin/modul" className="mt-2 text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:underline">
            Lihat semua modul <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Soal</span>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{stats.totalSoal}</span>
            <span className="text-xs font-semibold text-slate-400">Pertanyaan Terdaftar</span>
          </div>
          <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            Pilihan Ganda A-B-C-D
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Log Aktivitas</span>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{logs.length}</span>
            <span className="text-xs font-semibold text-slate-400">Riwayat Terkini</span>
          </div>
          <span className="inline-block mt-2 text-xs font-semibold text-slate-500">
            Terdeteksi secara realtime
          </span>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-rose-600" />
              Live Activity Log Guru & Pengajar
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Memantau pengajar yang sedang menginput soal, membuat modul, mengedit, atau menghapus materi
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan Log</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
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
                  <th className="pb-3 px-4">Aktivitas / Aksi</th>
                  <th className="pb-3 px-4">Detail Kegiatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {logs.map((log) => {
                  const pengajar = (log.pengajar_profiles as any);
                  const isModul = log.action.toLowerCase().includes('modul');
                  const isSoal = log.action.toLowerCase().includes('soal');
                  const isDaftar = log.action.toLowerCase().includes('daftar');

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
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            {pengajar?.username ? pengajar.username.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-xs">
                              {pengajar?.username ? `@${pengajar.username}` : 'Pengajar / System'}
                            </span>
                            {pengajar?.email && (
                              <p className="text-[10px] text-slate-400">{pengajar.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isModul 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : isSoal
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDaftar
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
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
