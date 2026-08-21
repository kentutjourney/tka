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
  Flame,
  Zap,
  ClipboardCheck,
} from 'lucide-react';

import Link from 'next/link';

/* ── helpers ── */
function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(score, 100);
  const color = pct >= 80 ? '#10b981' : pct >= 65 ? '#f59e0b' : '#f43f5e';
  return (
    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

/* ── stat card ── */
interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: React.ElementType;
  gradient: string;
  href?: string;
  badge?: React.ReactNode;
}

function StatCard({ label, value, delta, icon: Icon, gradient, href, badge }: StatCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-default">
      {/* gradient splash top-right */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${gradient}`} />
      {/* top micro-bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${gradient} shadow-lg text-white`}>
            <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-4xl font-black text-slate-900 tabular-nums leading-none">{value}</span>
          {delta && <span className="text-xs font-semibold text-slate-400">{delta}</span>}
        </div>

        {badge}

        {href && (
          <Link
            href={href}
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 transition-colors"
          >
            Lihat detail <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ── log item ── */
function LogItem({ log, idx }: { log: any; idx: number }) {
  const isRecent = idx === 0;
  return (
    <div className={`flex gap-3 group ${isRecent ? 'opacity-100' : 'opacity-80 hover:opacity-100'} transition-opacity`}>
      {/* timeline dot */}
      <div className="flex flex-col items-center pt-0.5 shrink-0">
        <div className={`w-2 h-2 rounded-full shrink-0 ${isRecent ? 'bg-violet-500 shadow-[0_0_6px_2px_rgba(139,92,246,0.4)]' : 'bg-slate-300'}`} />
        <div className="w-px flex-1 bg-slate-100 mt-1.5" />
      </div>
      {/* content */}
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 leading-none truncate max-w-[55%]">
            {log.action}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            <span className="text-[9px] text-slate-400 font-medium">
              {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{log.details}</p>
      </div>
    </div>
  );
}

/* ── main page ── */
export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPengajar: 0, pendingPengajar: 0,
    totalModul: 0, totalSoal: 0,
    totalUjianSelesai: 0, rataRataNilai: 0,
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);

      const [{ data: pengajars }, { count: totalModul }, { count: totalSoal }, { data: examData }, { data: logData }] =
        await Promise.all([
          supabase.from('pengajar_profiles').select('id, status'),
          supabase.from('modules').select('*', { count: 'exact', head: true }),
          supabase.from('questions').select('*', { count: 'exact', head: true }),
          supabase.from('exam_results').select('*').order('created_at', { ascending: false }),
          supabase
            .from('activity_logs')
            .select('id, action, details, created_at, user_id, pengajar_profiles(username, email)')
            .order('created_at', { ascending: false })
            .limit(15),
        ]);

      const totalPengajar = pengajars?.length || 0;
      const pendingPengajar = pengajars?.filter(p => p.status === 'pending').length || 0;
      const totalUjianSelesai = examData?.length || 0;
      const scores = examData?.map(e => Number(e.skor) || 0) || [];
      const rataRataNilai = scores.length > 0
        ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
        : 0;

      setStats({ totalPengajar, pendingPengajar, totalModul: totalModul || 0, totalSoal: totalSoal || 0, totalUjianSelesai, rataRataNilai });
      setRecentExams(examData?.slice(0, 8) || []);
      setLogs(logData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto">

      {/* ── Pending Banner ── */}
      {stats.pendingPengajar > 0 && (
        <div className="relative overflow-hidden flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_white_0%,_transparent_60%)]" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-white text-sm">
                {stats.pendingPengajar} Pengajar Menunggu Persetujuan
              </p>
              <p className="text-[11px] text-white/80 font-medium">Pengajar tidak bisa login sebelum diapprove</p>
            </div>
          </div>
          <Link
            href="/superadmin/pengajar"
            className="relative z-10 shrink-0 px-4 py-2 rounded-xl bg-white text-amber-700 text-[11px] font-black shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Tinjau Sekarang →
          </Link>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Pengajar"
          value={stats.totalPengajar}
          delta="akun"
          icon={Users}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          href="/superadmin/pengajar"
          badge={
            stats.pendingPengajar > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="text-[10px] font-bold text-amber-600">{stats.pendingPengajar} pending approval</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600">Semua aktif</span>
              </div>
            )
          }
        />
        <StatCard
          label="Total Modul"
          value={stats.totalModul}
          delta="modul"
          icon={BookOpen}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          href="/superadmin/modul"
          badge={
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-500" />
              <span className="text-[10px] font-bold text-blue-600">{stats.totalSoal} total soal</span>
            </div>
          }
        />
        <StatCard
          label="Ujian Selesai"
          value={stats.totalUjianSelesai}
          delta="sesi"
          icon={GraduationCap}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          href="/superadmin/hasil"
          badge={
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600">Total dikerjakan</span>
            </div>
          }
        />
        <StatCard
          label="Rata-Rata Nilai"
          value={stats.rataRataNilai}
          delta="/ 100"
          icon={Trophy}
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
          badge={
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
                  style={{ width: `${stats.rataRataNilai}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-500 shrink-0">{stats.rataRataNilai}%</span>
            </div>
          }
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Approve Pengajar', href: '/superadmin/pengajar', color: 'hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700', icon: Users },
          { label: 'Tinjau Pengajuan', href: '/superadmin/pengajuan', color: 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700', icon: ClipboardCheck },
          { label: 'Bank Soal', href: '/superadmin/modul', color: 'hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700', icon: BookOpen },
          { label: 'Rekap Nilai', href: '/superadmin/hasil', color: 'hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700', icon: BarChart3 },
        ].map(({ label, href, color, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs transition-all duration-200 ${color} group shadow-sm hover:shadow-md`}
          >
            <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
            {label}
            <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* ── Bottom Two-Column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Recent Exams */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Hasil Nilai Terbaru
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Siswa yang baru menyelesaikan ujian</p>
            </div>
            <Link href="/superadmin/hasil" className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
              Lihat Semua <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* column header */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-6 py-2 border-b border-slate-50 bg-slate-50/60">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Siswa & Modul</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 text-right">Skor</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 w-16 text-right">Bar</p>
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="py-14 flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400">Memuat data...</p>
              </div>
            ) : recentExams.length === 0 ? (
              <div className="py-14 text-center">
                <GraduationCap className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Belum ada data ujian</p>
              </div>
            ) : (
              recentExams.map((exam) => {
                const score = Number(exam.skor);
                const isHigh = score >= 80;
                const isMed = score >= 65;
                return (
                  <div key={exam.id} className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center px-6 py-3 hover:bg-slate-50/70 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm">
                        {exam.nama_lengkap?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate uppercase">{exam.nama_lengkap}</p>
                        <p className="text-[9px] text-slate-400 truncate">{exam.mata_pelajaran} · {exam.nama_modul}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-black tabular-nums px-2 py-0.5 rounded-lg ${
                      isHigh ? 'text-emerald-700 bg-emerald-50' : isMed ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'
                    }`}>
                      {score}
                    </span>
                    <div className="w-16 flex justify-end">
                      <ScoreBar score={score} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-6 py-4 border-t border-slate-50">
            <Link
              href="/superadmin/hasil"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Buka Rekapitulasi Lengkap
            </Link>
          </div>
        </div>

        {/* Live Log */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <div className="relative">
                  <History className="w-4 h-4 text-violet-500" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
                </div>
                Live Activity Log
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Aktivitas pengajar real-time</p>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-violet-500' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-0">
            {loading ? (
              <div className="py-14 flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-400">Memuat log...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-14 text-center">
                <History className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Belum ada log aktivitas</p>
              </div>
            ) : (
              logs.map((log, i) => <LogItem key={log.id} log={log} idx={i} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
