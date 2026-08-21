'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  BookOpen, 
  History, 
  RefreshCw, 
  AlertCircle,
  BarChart3,
  GraduationCap,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

function StatCard({ 
  label, value, sub, icon: Icon, color, href, badge 
}: { 
  label: string; value: string | number; sub?: string; icon: any; 
  color: { bg: string; icon: string; text: string; border: string; glow: string }; 
  href?: string; badge?: React.ReactNode;
}) {
  return (
    <div className={`group relative bg-white rounded-2xl p-5 border ${color.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}>
      {/* Background glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-6 translate-x-6 ${color.glow}`} />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${color.text}`}>{value}</span>
            {sub && <span className="text-xs font-semibold text-slate-400">{sub}</span>}
          </div>
          {badge && <div className="mt-2">{badge}</div>}
          {href && (
            <Link href={href} className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors">
              Lihat detail <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${color.bg} ${color.icon} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPengajar: 0,
    pendingPengajar: 0,
    totalModul: 0,
    totalSoal: 0,
    totalUjianSelesai: 0,
    rataRataNilai: 0,
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const { data: pengajars } = await supabase.from('pengajar_profiles').select('id, status');
      const totalPengajar = pengajars?.length || 0;
      const pendingPengajar = pengajars?.filter(p => p.status === 'pending').length || 0;

      const { count: totalModul } = await supabase.from('modules').select('*', { count: 'exact', head: true });
      const { count: totalSoal } = await supabase.from('questions').select('*', { count: 'exact', head: true });

      const { data: examData } = await supabase
        .from('exam_results')
        .select('*')
        .order('created_at', { ascending: false });

      const totalUjianSelesai = examData?.length || 0;
      const scores = examData?.map(e => Number(e.skor) || 0) || [];
      const rataRataNilai = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';

      const { data: logData } = await supabase
        .from('activity_logs')
        .select(`id, action, details, created_at, user_id, pengajar_profiles (username, email)`)
        .order('created_at', { ascending: false })
        .limit(12);

      setStats({
        totalPengajar,
        pendingPengajar,
        totalModul: totalModul || 0,
        totalSoal: totalSoal || 0,
        totalUjianSelesai,
        rataRataNilai: Number(rataRataNilai),
      });

      setRecentExams(examData?.slice(0, 6) || []);
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
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Pending Alert Banner */}
      {stats.pendingPengajar > 0 && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">
                {stats.pendingPengajar} Pendaftaran Pengajar Menunggu Persetujuan
              </p>
              <p className="text-xs text-amber-700 mt-0.5">Pengajar tidak bisa login sebelum disetujui.</p>
            </div>
          </div>
          <Link
            href="/superadmin/pengajar"
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-sm shadow-amber-500/30"
          >
            Tinjau Sekarang →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Pengajar"
          value={stats.totalPengajar}
          sub="Akun"
          icon={Users}
          color={{ bg: 'bg-rose-50', icon: 'text-rose-600', text: 'text-slate-900', border: 'border-slate-200', glow: 'bg-rose-300' }}
          href="/superadmin/pengajar"
          badge={stats.pendingPengajar > 0 ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />
              {stats.pendingPengajar} pending
            </span>
          ) : undefined}
        />
        <StatCard
          label="Total Modul"
          value={stats.totalModul}
          sub="Modul"
          icon={BookOpen}
          color={{ bg: 'bg-indigo-50', icon: 'text-indigo-600', text: 'text-slate-900', border: 'border-slate-200', glow: 'bg-indigo-200' }}
          href="/superadmin/modul"
        />
        <StatCard
          label="Ujian Selesai"
          value={stats.totalUjianSelesai}
          sub="Sesi"
          icon={GraduationCap}
          color={{ bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-slate-900', border: 'border-slate-200', glow: 'bg-emerald-200' }}
          href="/superadmin/hasil"
        />
        <StatCard
          label="Rata-Rata Nilai"
          value={stats.rataRataNilai}
          sub="/ 100"
          icon={Trophy}
          color={{ bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-700', border: 'border-slate-200', glow: 'bg-purple-200' }}
        />
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Recent Exams — wider */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Hasil Nilai Terbaru</h3>
                <p className="text-[10px] text-slate-500">6 sesi ujian terakhir</p>
              </div>
            </div>
            <Link href="/superadmin/hasil" className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
              Lihat Semua <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="py-10 text-center text-slate-400 text-xs">Memuat data...</div>
            ) : recentExams.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">Belum ada data ujian.</div>
            ) : (
              <div className="space-y-2">
                {recentExams.map((exam) => {
                  const score = Number(exam.skor);
                  const isHigh = score >= 80;
                  const isMed = score >= 65 && score < 80;
                  return (
                    <div key={exam.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition group">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {exam.nama_lengkap?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate uppercase">{exam.nama_lengkap}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{exam.nama_modul} · {exam.mata_pelajaran}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <TrendingUp className={`w-3 h-3 ${isHigh ? 'text-emerald-500' : isMed ? 'text-amber-500' : 'text-rose-400'}`} />
                        <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${
                          isHigh ? 'bg-emerald-100 text-emerald-800' : 
                          isMed ? 'bg-amber-100 text-amber-800' : 
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {score}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 pb-4">
            <Link
              href="/superadmin/hasil"
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs text-center transition flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Buka Rekapitulasi Lengkap
            </Link>
          </div>
        </div>

        {/* Live Log — narrower */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Live Activity Log</h3>
                <p className="text-[10px] text-slate-500">Aktivitas pengajar terkini</p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-rose-500' : ''}`} />
            </button>
          </div>

          <div className="p-4 max-h-[360px] overflow-y-auto space-y-2.5 scrollbar-thin">
            {loading ? (
              <div className="py-10 text-center text-slate-400 text-xs">Memuat log...</div>
            ) : logs.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">Belum ada log aktivitas.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 truncate max-w-[65%]">
                      {log.action}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
